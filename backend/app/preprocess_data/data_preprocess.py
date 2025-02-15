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
    
    # date_obj = datetime.strptime(drawNumber, "%Y-%m-%d").date()
    
    # Load environment variables
    
    cwd_dir = Path(__file__).resolve()
    
    root_dir = cwd_dir
    
    # Keep going up until you find a specific marker (e.g., `.env`, `pyproject.toml`, or `.git`)
    while root_dir.name not in ("ai.lottotry.com", "") and root_dir.parent != root_dir:
        root_dir = root_dir.parent
    load_dotenv(dotenv_path=root_dir / '.env')
    
    DB_UID = os.getenv("DB_UID")
    DB_PWD = os.getenv("DB_PWD")
    DB_SERVER = os.getenv("DB_SERVER")
    DB_NAME = os.getenv("DB_NAME")
    DB_TYPE = os.getenv("DB_TYPE")
    
    # Step 1: Load the data
    conn = pyodbc.connect(f'DRIVER={DB_TYPE};SERVER={DB_SERVER};DATABASE={DB_NAME};UID={DB_UID};PWD={DB_PWD}')
    
    query_path = cwd_dir.parent / 'saved_training_data' / query_file
    
    with open(query_path, "r") as file:
        query = file.read()
    
    df = pd.read_sql(query, conn, params=[lotto_name, drawNumber])
    
    #cursor.close()
    conn.close()
    
    # Step 2: Handle missing values
    df = df.fillna(0)
    
    # Sort draws chronologically and reset index
    # Sort draws chronologically and reset index
    df = df.sort_values(['DrawNumber', 'Number']).reset_index(drop=True)
    
    # df['IsBonusNumber'] = df['IsBonusNumber'].astype(int)
    df['IsHit'] = df['IsHit'].astype(int)
    
    df['TotalHits'] = df.groupby('Number')['IsHit'].cumsum()
    df['TotalDraws'] = df.groupby('Number').cumcount() + 1

    
    # For categorical features
    #df["Temperature"] = df["Temperature"].map(get_temperature).astype(int)
    df["Temperature"] = df["Distance"].apply(get_temperature)
    
    # Example engineered feature: "Recency-weighted hits"
    # 1e-5 prevents division by zero when Distance=0 (current hit).
    df['WeightedHits'] = df['HitsLast10Draws'] / (df['Distance'] + 1e-5)
           
    # Step 4: Normalize manually
    df['PrevDrawEvenCount'] = df['PrevDrawEvenCount'] / 7
    
    # Step 5: Normalize numerical features
    count_features = ['Distance', 'NumberofDrawsWhenHit', 'HitsLast10Draws', 'TotalHits',  'Temperature', 'WeightedHits']
    scaler = MinMaxScaler(feature_range=(0, 1))
    df[count_features] = scaler.fit_transform(df[count_features])
    

    # Step 6: Split the data
    X = df.drop(columns=['NextDrawHit'])
    y = df['NextDrawHit']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=False)
    
    # Remove Number Feature
    X_train = X_train.drop(columns=['Number'])
    
    # Instead of TotalHits (cumulative), use rolling window hits:
    df['HitsLastMonth'] = df.groupby('Number')['IsHit'].transform(
        lambda x: x.rolling(30, min_periods=1).sum()
    )

    # Add "Consecutive Misses" streak:
    df['MissStreak'] = df.groupby('Number')['IsHit'].transform(
        lambda x: x.eq(0).cumsum().sub(x.eq(0).cumsum().where(x.eq(0), 0))
    )
    
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

    
    # Track Beta distributions for each number
    df['Alpha'] = df['TotalHits'] + 1
    df['Beta'] = df['TotalDraws'] - df['TotalHits'] + 1
    df['ThompsonProb'] = np.random.beta(df['Alpha'], df['Beta'])
    
        
    # Step 7: Save the preprocessed data
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
