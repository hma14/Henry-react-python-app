import pandas as pd
import pyodbc
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.model_selection import train_test_split
import os
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from datetime import datetime


def get_temperature(Distance):
    if Distance == 0:
        return 0
    elif Distance <= 5 and Distance > 0:
        return 1
    elif Distance <= 10 and Distance > 5:
        return 2
    elif Distance <= 15 and Distance > 10:
        return 3
    elif Distance <= 25 and Distance > 15:
        return 4
    else:  # distance > 25
        return 5


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
    
    # Step 3: Feature engineering
    
    # df['IsBonusNumber'] = df['IsBonusNumber'].astype(int)
    df['IsHit'] = df['IsHit'].astype(int)
    
    
    # For categorical features
    #df["Temperature"] = df["Temperature"].map(get_temperature).astype(int)
    df["Temperature"] = df["Distance"].apply(get_temperature)
      
    # Step 4: Normalize numerical features
    count_features = ['Distance', 'NumberofDrawsWhenHit', 'HitsLast10Draws', 'TotalHits', 'PrevDrawEvenCount', 'Temperature']
    scaler = MinMaxScaler(feature_range=(0, 1))
    df[count_features] = scaler.fit_transform(df[count_features])
    
    
    # Step 5: Encode categorical features
    #df = pd.get_dummies(df, columns=['Temperature'], prefix='Temp')
    
    # Step 6: Split the data
    X = df.drop(columns=['NextDrawHit'])
    y = df['NextDrawHit']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=False)
    
    # Step 7: Save the preprocessed data
    if save_to_csv:
        try:
            save_dir = Path(__file__).resolve().parent / 'saved_training_data'
            os.makedirs(save_dir, exist_ok=True)  
            
            X_train_path = os.path.join(save_dir, "X_train.csv")
            X_train.to_csv(X_train_path, index=False)
            
            X_test_path = os.path.join(save_dir, "X_test.csv")
            X_test.to_csv(X_test_path, index=False)
            
            y_train_path = os.path.join(save_dir, "y_train.csv")
            y_train.to_csv(y_train_path, index=False)
            
            y_test_path = os.path.join(save_dir, "y_test.csv")
            y_test.to_csv(y_test_path, index=False)
            
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
    
    html = f"""
    <h2>X_train</h2> {X_train.to_html()}
    <h2>X_test</h2> {X_test.to_html()}
    <h2>y_train</h2> {y_train.to_frame().to_html()}
    <h2>y_test</h2> {y_test.to_frame().to_html()}
    """
    return html
