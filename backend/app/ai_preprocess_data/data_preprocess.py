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
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM
from utils.database import Database


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


def save_training_data(X_train, X_test, y_train, y_test):
    """Saves training and testing datasets as CSV files."""
    save_dir = Path(__file__).resolve().parent / 'saved_training_data'
    os.makedirs(save_dir, exist_ok=True)

    datasets = {
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test
    }

    for name, df in datasets.items():
        df.to_csv(save_dir / f"{name}.csv", index=False)


def preprocess_data(query_file, lotto_name, drawNumber = 1, save_to_csv=True):
    
    db = Database()
    query_file = "feature_engineering_query_dev.sql"
    df = db.fetch_data(query_file, params=(lotto_name, drawNumber))    
    db.close()
    
        
    # Step 2: Handle missing values
    df = df.fillna(0)
    
    
    # Sort draws chronologically and reset index
    # Sort draws chronologically and reset index
    df = df.sort_values(['DrawNumber', 'Number']).reset_index(drop=True)
    
    # define if this number is cold or not
    df["Distance_Active"] = (df["Distance"] > 15).astype(int)
    
    # or
    #df["Distance_Active"] = np.where(df['Distance'] > 15, 1, 0)
    
    #df["Consecutive_Hits"] = df.groupby("Number")["NumberofDrawsWhenHit"].transform(
    #lambda x: (x == 1).rolling(window=2, min_periods=1).sum()).astype(int)
    
    # Step 1: Identify only the rows where NumberofDrawsWhenHit is nonzero (actual hits)
    df["Hit_Index"] = df["NumberofDrawsWhenHit"].replace(0, None)

    # Step 2: Forward-fill to retain the most recent hit's value *only moving forward*
    df["Last_Hit_Index"] = df.groupby("Number")["Hit_Index"].ffill()
    
    # Step 2: Check if last hit was `NumberofDrawsWhenHit == 1`
    df["Consecutive_Hits"] = (df["Last_Hit_Index"] == 1).astype(int)
    
    # define NumDrawsWhenHit_Active
    df["NumDrawsWhenHit_Active"] = (df["Last_Hit_Index"] > 12).astype(int)

    # Drop helper column for clarity
    df.drop(columns=["Last_Hit_Index"], inplace=True)
    # end Consecutive_Hits

    # define HitsLast10_Active
    df["HitsLast10_Active"] = (df["HitsLast10Draws"] > 2).astype(int)
        
    count_features = [ 'Distance_Active', 'Consecutive_Hits', 'NumDrawsWhenHit_Active', "HitsLast10_Active"]    

    # Step 6: Split the data
    #X = df.drop(columns=['NextDrawHit'])
    X = df[count_features]  # Keep necessary features only 
    y = df['NextDrawHit']  # Assuming 'NextDrawHit' is the target variable
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=False)
    
     # Add "Consecutive Misses" streak:
    df['MissStreak'] = df.groupby('Number')['IsHit'].transform(
        lambda x: x.eq(0).cumsum().sub(x.eq(0).cumsum().where(x.eq(0), 0))
    )
    
    # another way for "Consecutive Misses" streak:
    # df['MissStreak'] = df.groupby('Number')['IsHit'].apply(lambda x: x.groupby((x == 1).cumsum()).cumcount())

    X_train = pd.concat([X_train, df['MissStreak']], axis=1).fillna(0)


    # Track Beta distributions for each number
    # These lines define parameters for the Beta distribution, 
    # which is commonly used in Bayesian probability modeling.
    # The +1 is a Laplace Smoothing (Bayesian Prior) to prevent division by zero and avoid assigning zero probability to any number.
    
    df['TotalHits'] = df.groupby('Number')['IsHit'].cumsum()
    df['TotalDraws'] = df.groupby('Number').cumcount() + 1
    df['Alpha'] = df['TotalHits'] + 1                                    #  Represents "successes" (times the number was drawn).
    df['Beta'] = df['TotalDraws'] - df['TotalHits'] + 1                  #  Represents "failures" (times the number was NOT drawn).
    df['ThompsonProb'] = np.random.beta(df['Alpha'], df['Beta'])         # This line generates Thompson Probability using a Beta distribution with parameters (α, β):
    X_train = pd.concat([X_train, df['ThompsonProb']], axis=1).fillna(0)
    
    print('----------------')
    print(X_train.columns)  # Prints the feature names
    print(X_train.head())   # Prints the first few rows to check the data
    print('----------------')

    
    """
    # Remove Number Feature
    X_train = X_train.drop(columns=['Number'])
    
    # Instead of TotalHits (cumulative), use rolling window hits:
    df['HitsLastMonth'] = df.groupby('Number')['IsHit'].transform(
        lambda x: x.rolling(30, min_periods=1).sum()
    )
  
    # The line `X_train = pd.concat([X_train, df['HitsLastMonth']], axis=1).fillna(0)` is concatenating
    # the DataFrame `X_train` with the 'HitsLastMonth' column from the DataFrame `df` along the columns
    # (axis=1).

    X_train = pd.concat([X_train, df['HitsLastMonth']], axis=1).fillna(0)
    
 
       
    # Use Focal Loss (handles extreme imbalance better):
    model = LGBMClassifier(
        objective='binary',
        class_weight={0:1, 1:10},  # Adjust weights
        metric='auc'
    )
    
    lookback_window = 10  # Use the last 10 draws to predict the next one
    n_features = X_train.shape[1]  # Number of columns in your training data
    
    model = Sequential([
        LSTM(64, input_shape=(lookback_window, n_features)),
        Dense(1, activation='sigmoid')
    ])
    
    
    # remove unnecessary features
    features_to_remove = ['IsHit', 'DrawNumber']  # [ 'TotalHits', 'HitsLastMonth', 'HitsLast10Draws', 'NumberofDrawsWhenHit', 'MissStreak']
    
    # add a new feature. Example: Create a new feature "HitRate" based on TotalHits and TotalDraws
    X_train['HitRate'] = X_train['TotalHits'] / (X_train['TotalDraws'] + 1)  # Avoid division by zero
    X_test['HitRate'] = X_test['TotalHits'] / (X_test['TotalDraws'] + 1)


    # Remove from training and test sets
    X_train = X_train.drop(columns=features_to_remove)
    X_test = X_test.drop(columns=features_to_remove)

    
 
    # Create a co-occurrence matrix
    from sklearn.feature_extraction.text import CountVectorizer
    from sklearn.decomposition import PCA
    
    draws_as_strings = df.groupby('DrawNumber')['Number'].agg(lambda x: ' '.join(map(str, x)))
    
    
    vectorizer = CountVectorizer(analyzer='word', ngram_range=(2,2))
    co_occurrence = vectorizer.fit_transform(draws_as_strings)
    
    pca = PCA(n_components=8)  # Keep top 5 principal components
    co_occurrence_pca = pca.fit_transform(co_occurrence.toarray())
    # Convert back to DataFrame
    co_occurrence_df = pd.DataFrame(co_occurrence_pca, columns=[f'co_occ_{i}' for i in range(8)])
    #co_occurrence_df = pd.DataFrame(co_occurrence.toarray(), columns=vectorizer.get_feature_names_out())


    # Merge with X_train
    X_train = pd.concat([X_train, co_occurrence_df], axis=1).fillna(0)

    
    
        
    """
            
    # Save the preprocessed data
    if save_to_csv:
        try:
            save_training_data(X_train, X_test, y_train, y_test)
            print("File saved successfully!")
        except Exception as e:
            print("Error while saving: ", e)
            
    """     
    return jsonify({
        "X_train": X_train.to_json(orient="records"),
        "X_test": X_test.to_json(orient="records"),
        "y_train": y_train.to_json(orient="records"),
        "y_test": y_test.to_json(orient="records")
    })
    """    
    
    return f"""
    <h2>X_train</h2> {X_train.to_html()}
    <h2>X_test</h2> {X_test.to_html()}
    <h2>y_train</h2> {y_train.to_frame().to_html()}
    <h2>y_test</h2> {y_test.to_frame().to_html()}
    """
