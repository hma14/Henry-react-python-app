import pandas as pd
import numpy as np
from sklearn.model_selection import TimeSeriesSplit
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, precision_score, recall_score, roc_auc_score, accuracy_score
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from imblearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE
import joblib
from lightgbm import LGBMClassifier
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.model_selection import train_test_split
from flask import Flask, jsonify, request, send_file
from sklearn.utils.class_weight import compute_class_weight
from imblearn.over_sampling import SMOTE
import matplotlib.pyplot as plt
from pathlib import Path
import os


def create_sequences(X, y, lookback):
    Xs, ys = [], []
    y = y.to_numpy() if hasattr(y, "to_numpy") else y  # Ensure y is an array
    for i in range(len(X) - lookback):
        Xs.append(X[i:i+lookback])
        ys.append(y[i+lookback])  # or another strategy to pick the corresponding label
    return np.array(Xs), np.array(ys)


def training_LSTM_model(X_train, X_test, y_train, y_test, lookback_window=10, epochs=5):
    try:  
        original_feature_names = X_train.columns.tolist()  # Get original names
        # Convert to numpy arrays if needed
        X_train, X_test, y_train, y_test = map(lambda x: np.array(x), [X_train, X_test, y_train, y_test])

        # Create sequences
        X_train_seq, y_train_seq = create_sequences(X_train, y_train, lookback_window)
        X_test_seq, y_test_seq = create_sequences(X_test, y_test, lookback_window)

        # Print shapes for debugging
        print("X_train_seq shape:", X_train_seq.shape)  # Should be (samples, lookback_window, features)
        print("y_train_seq shape:", y_train_seq.shape)  # Should be (samples,)

        # Define LSTM model
        model = Sequential([
            LSTM(64, input_shape=(lookback_window, X_train_seq.shape[2])),
            Dense(1, activation='sigmoid')
        ])
        
        # Compute class weights
        class_weights = compute_class_weight(class_weight="balanced", classes=np.unique(y_train_seq.flatten()), y=y_train_seq.flatten())
        class_weight_dict = {cls: weight for cls, weight in zip(np.unique(y_train_seq.flatten()), class_weights)}

        # Compile model
        optimizer = Adam(learning_rate=0.001)
        model.compile(optimizer=optimizer, loss="binary_crossentropy", metrics=["accuracy"])
        
        # Define early stopping
        early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

        # Train the model
        model.fit(
            X_train_seq, y_train_seq, 
            epochs=epochs, validation_split=0.2, 
            callbacks=[early_stop],
            class_weight=class_weight_dict
        )

        # Get probabilities
        proba = model.predict(X_train_seq).flatten()

        # Convert X_train_seq back to DataFrame
        

        # Convert back to DataFrame, keeping only the last time step
        X_train_df = pd.DataFrame(X_train_seq[:, -1, :], columns=original_feature_names)        
        print(X_train_df.columns)

        X_train_df["Probability"] = proba

        # Extract top hit numbers
        top_hit_numbers = X_train_df.sort_values("Probability", ascending=False)["Number"].unique()[:12]
        
        return X_train_df, top_hit_numbers

    except Exception as e:
        print(f"Training failed: {str(e)}")
        raise