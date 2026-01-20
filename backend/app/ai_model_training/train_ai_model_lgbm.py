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
from database import Database
from sklearn.metrics import accuracy_score, roc_auc_score
import lightgbm as lgb
from ai_preprocess_data.data_preprocess import save_training_data



def train_ai_model_LightGBM (table_name, lotto_name, to_draw_number, from_draw_number = 1, save_to_csv=True):
    
    db = Database(table_name)
    query_file = "feature_engineering_query.sql"
    df = db.fetch_data(query_file, params=(lotto_name, from_draw_number, to_draw_number))    
    db.close()
    
        
    # Step 2: Handle missing values
    if df is not None:
        df = df.fillna(0)  
    else:
        print("Error: df is None!")
        return None, None   

    
    
    # Sort draws chronologically and reset index
    #df = df.sort_values(['DrawNumber', 'Number']).reset_index(drop=True)
    
    df["Number"].value_counts().sort_index().plot(kind="bar")

    
    # define if this number is cold or not
    df["Distance_Boiling"] = (df["Distance"] == 1).astype(int)
    df["Distance_Hot"] =  ((df["Distance"] > 1) & (df["Distance"] < 6)).astype(int)
    df["Distance_Normal"] = ((df["Distance"] >= 6) & (df["Distance"] <= 10)).astype(int)
    df["Distance_Cold"] = ((df["Distance"] > 10) & (df["Distance"] < 16)).astype(int)
    df["Distance_Freezing"] = (df["Distance"] >= 16).astype(int)
            
    # Instead of TotalHits (cumulative), use rolling window hits:
    df['multiple_hits_last_10'] = (df['HitsLast10Draws'] >= 2).astype(int)
    
    df['last_hit_gap'] = df.groupby('Number')['NumberofDrawsWhenHit'].ffill()
    df['last_hit_gap_over_12'] = (df['last_hit_gap'] > 12).astype(int)
    
    # Calculate gaps between consecutive hits for each number
    df['prev_hit_gap'] = df.groupby('Number')['NumberofDrawsWhenHit'].shift(1)
    df['has_consecutive_hits'] = (
        (df['NumberofDrawsWhenHit'] == 1) & 
        (df['prev_hit_gap'] == 1)
    ).astype(int)

    features = [ 'Number', 'Distance_Boiling', 'Distance_Hot', 'Distance_Normal', 'Distance_Cold', 'Distance_Freezing', 
                 'multiple_hits_last_10',  'last_hit_gap_over_12', 'has_consecutive_hits' ]    
    
    # Train-test split (temporal)
    split_idx = int(0.8 * len(df))
    X_train = df[features].iloc[:split_idx]
    y_train = df['NextDrawHit'].iloc[:split_idx]
    X_test = df[features].iloc[split_idx:]
    y_test = df['NextDrawHit'].iloc[split_idx]
    
    model = lgb.LGBMClassifier(
        objective='binary',
        class_weight={0:1, 1:10},  # Adjust for class imbalance
        metric='auc'
    )

    model.fit(X_train, y_train)

    # Evaluate
    from sklearn.metrics import recall_score, roc_auc_score
    y_pred = model.predict(X_test)
    proba = model.predict_proba(X_train)[:, 1]
    X_train["Probability"] = proba
    top_hit_numbers = X_train.sort_values("Probability", ascending=False)["Number"].unique()[:12]

    #print(f"Recall: {recall_score(y_test, y_pred)}")
    #print(f"ROC AUC: {roc_auc_score(y_test, y_proba)}")
        
   
            
    return X_train, top_hit_numbers
