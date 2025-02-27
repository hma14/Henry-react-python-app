import pandas as pd
import pyodbc
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.model_selection import train_test_split
import os
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from datetime import datetime
from lightgbm import LGBMClassifier
import numpy as np
import tensorflow as tf
from utils.database import Database
from sklearn.metrics import accuracy_score, roc_auc_score


def get_temperature(Distance):
    if Distance == 0:
        return 0 # Boiling
    elif Distance <= 3:
        return 1 # Very Hot
    elif Distance <= 7:
        return 2 # Hot
    elif Distance <= 12:
        return 3 # Neutral
    elif Distance <= 20:
        return 4 # Cold
    else:  # distance > 20
        return 5 # Very Cold




def save_training_data(dir, X_train, X_test, y_train, y_test):
    """Saves training and testing datasets as CSV files."""
    save_dir = Path(__file__).resolve().parent / 'saved_training_data' / dir
    os.makedirs(save_dir, exist_ok=True)

    datasets = {
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test
    }

    for name, df in datasets.items():
        df.to_csv(save_dir / f"{name}.csv", index=False)


def preprocess_data(query_file, lotto_name, to_draw_number, from_draw_number = 1, save_to_csv=True):
    
    db = Database()
    query_file = "feature_engineering_query.sql"
    df = db.fetch_data(query_file, params=(lotto_name, from_draw_number, to_draw_number))    
    db.close()
    
        
    # Step 2: Handle missing values
    if df is not None:
        df = df.fillna(0)  
    else:
        print("Error: df is None!")

    
    
    # Sort draws chronologically and reset index
    #df = df.sort_values(['DrawNumber', 'Number']).reset_index(drop=True)
    
    df["Number"].value_counts().sort_index().plot(kind="bar")

    
    # define if this number is cold or not
    df["Distance_Boiling"] = (df["Distance"] == 1).astype(int)
    df["Distance_Hot"] =  ((df["Distance"] > 1) & (df["Distance"] < 6)).astype(int)
    df["Distance_Normal"] = ((df["Distance"] >= 6) & (df["Distance"] <= 10)).astype(int)
    df["Distance_Cold"] = ((df["Distance"] > 10) & (df["Distance"] < 16)).astype(int)
    df["Distance_Freezing"] = (df["Distance"] >= 16).astype(int)
        
    df['MissStreak'] = df.groupby('Number')['IsHit'].transform(
        lambda x: x.eq(0).cumsum().sub(x.eq(0).cumsum().where(x.eq(0), 0))
    )

    rolling_window = 30
    df["MissStreak_RollingMean"] = df.groupby("Number")["MissStreak"].transform(lambda x: x.rolling(window=rolling_window, min_periods=1).mean())
    df["MissStreak_RollingStd"] = df.groupby("Number")["MissStreak"].transform(lambda x: x.rolling(rolling_window, min_periods=1).std())
    df["MissStreak_RollingSum"] = df.groupby("Number")["MissStreak"].transform(lambda x: x.rolling(rolling_window, min_periods=1).sum())
    
        # Instead of TotalHits (cumulative), use rolling window hits:
    df['HitsLastMonth'] = df.groupby('Number')['IsHit'].transform(
        lambda x: x.rolling(rolling_window, min_periods=1).sum()
    )
  

    count_features = [ 'Number', 'HitsLastMonth', 'MissStreak', 'MissStreak_RollingMean', 'MissStreak_RollingStd', 'MissStreak_RollingSum' ]    

    # Step 6: Split the data
    X = df[count_features]  # Keep necessary features only 
    y = df['NextDrawHit']  # Assuming 'NextDrawHit' is the target variable
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=False)

    
    # Track Beta distributions for each number
    # These lines define parameters for the Beta distribution, 
    # which is commonly used in Bayesian probability modeling.
    # The +1 is a Laplace Smoothing (Bayesian Prior) to prevent division by zero and avoid assigning zero probability to any number.
    
    df['TotalHits'] = df.groupby('Number')['IsHit'].cumsum()
    df['TotalDraws'] = df.groupby('Number').cumcount() + 1
    df['Alpha'] = df['TotalHits'] + 1                                    #  Represents "successes" (times the number was drawn).
    df['Beta'] = df['TotalDraws'] - df['TotalHits'] + 1                  #  Represents "failures" (times the number was NOT drawn).
    
    df['ThompsonProb'] = np.random.beta(df['Alpha'], df['Beta'])         # This line generates Thompson Probability using a Beta distribution with parameters (α, β):
    df["ThompsonProb"].hist(bins=20, edgecolor="black")
    X_train = pd.concat([X_train, df.loc[X_train.index,'ThompsonProb']], axis=1).fillna(0)
    X_test= pd.concat([X_test, df.loc[X_test.index,'ThompsonProb']], axis=1).fillna(0)
    
    print('----------------')
    print(X_train.columns)  # Prints the feature names
    print(X_train.head())   # Prints the first few rows to check the data
    print('----------------')
    
        
    
    
    
            
    # Save the preprocessed data
    if save_to_csv:
        try:
            save_training_data("Pipeline", X_train, X_test, y_train, y_test)
            print("File saved successfully!")
        except Exception as e:
            print("Error while saving: ", e)
            
    
    
    return f"""
                <h2>X_train</h2> {X_train.to_html()}
                <h2>X_test</h2> {X_test.to_html()}
                <h2>y_train</h2> {y_train.to_frame().to_html()}
                <h2>y_test</h2> {y_test.to_frame().to_html()}
            """
