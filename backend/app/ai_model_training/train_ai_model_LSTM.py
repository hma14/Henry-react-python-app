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

_lookback_window = 10 
_epoch = 3

def create_sequences(X, y, lookback):
    Xs, ys = [], []
    y = y.to_numpy() if hasattr(y, "to_numpy") else y  # Ensure y is an array
    for i in range(len(X) - lookback):
        Xs.append(X[i:i+lookback])
        ys.append(y[i+lookback])  # or another strategy to pick the corresponding label
    return np.array(Xs), np.array(ys)


def training_LSTM_model(X_train, X_test, y_train, y_test):
    # cSpell:ignore tscv, iloc, proba, importances, lookback, crossentropy, jsonify, imblearn LGBM figsize edgecolor xticks xlabel ylabel
         
    # Use the last 10 draws to predict the next one, It learns patterns from past 10 draws (lookback_window).    
    n_features = 10 #X_train.shape[1]  #  Gets the number of input features (e.g., Distance, HitsLast10Draws, Temperature, etc.).        

    saved_dir = Path(__file__).resolve().parent.parent /  'ai_preprocess_data' / 'saved_training_data'
    model_path = saved_dir / 'lstm_model.pkl'
    try:                
        if os.path.exists(model_path):
             lstm_model = joblib.load(model_path)
        else:
            lstm_model = Sequential([
                LSTM(64, return_sequences=True, input_shape=(_lookback_window, n_features)),
                LSTM(32, return_sequences=False),
                Dense(16, activation='relu'),
                Dense(1, activation='sigmoid')
            ])

        # Compute class weights

        
        # Feature Validation
        required_features = [ 'Distance_Boiling','Distance_Normal','Distance_Cold','Distance_Freezing', 'HitsLastMonth',
                              'MissStreak', 'MissStreak_RollingMean', 'MissStreak_RollingStd', 'MissStreak_RollingSum' ] 
        
        if missing := [f for f in required_features if f not in X_train.columns]:
            raise ValueError(f"Missing critical features: {missing}")        
        
        X_train_seq, y_train_seq = create_sequences(X_train.values, y_train.values, _lookback_window)
        X_test_seq, y_test_seq = create_sequences(X_test.values, y_test.values, _lookback_window)
       
        
        print("X_train_seq shape:", X_train_seq.shape)  # Should be (samples, 10, 10)
        print("X_test_seq shape:", X_test_seq.shape)    # Should be (samples, 10, 10)
        print("y_train_seq shape:", y_train_seq.shape)  # Should be (samples,)   
        
        # Both .flatten() and .ravel() will convert y_train_seq into a 1D array.           
        print("y_train_seq distribution:", np.bincount(y_train_seq.flatten()))
        print("y_test_seq distribution:", np.bincount(y_test_seq.flatten()))
        
        optimizer = Adam(learning_rate=0.001)  # Default: 0.001 (try 0.0005 or 0.0001 if unstable)
        lstm_model.compile(optimizer=optimizer, loss="binary_crossentropy", metrics=["accuracy"])

        # Train LSTM
        early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
        
        # Reshape X_train_seq for SMOTE
        X_train_seq_reshaped = X_train_seq.reshape(X_train_seq.shape[0], -1)  # Flatten time series

        smote = SMOTE(sampling_strategy="auto", random_state=42)
        X_train_seq_resampled, y_train_seq_resampled = smote.fit_resample(X_train_seq_reshaped, y_train_seq.flatten())

        # Reshape X_train_seq_resampled back to (samples, time_steps, features)
        X_train_seq_resampled = X_train_seq_resampled.reshape(-1, _lookback_window, X_train_seq.shape[2])
        
        #lstm_model.fit(X_train_seq_resampled, y_train_seq_resampled, epochs=10, validation_split=0.2, callbacks=[early_stop])

      
        class_weights = compute_class_weight(class_weight="balanced", classes=np.unique(y_train_seq.flatten()), y=y_train_seq.flatten())
        class_weight_dict = {i: class_weights[i] for i in range(len(class_weights))}
        #class_weight_dict = {0: class_weights[0], 1: class_weights[1]}

        # Train with class weights
        lstm_model.fit(
            X_train_seq_resampled, y_train_seq_resampled, 
            epochs=_epoch, validation_split=0.2, 
            callbacks=[early_stop],
            class_weight=class_weight_dict  # ✅ Apply class weights
        )


   
        
        # Predictions
        predicted_classes = (lstm_model.predict(X_test_seq) > 0.5).astype(int).tolist()
          
        joblib.dump(lstm_model, model_path)
           
        # plot
        y_pred_array = np.array(predicted_classes)

        plt.figure(figsize=(10, 3))
        plt.hist(y_pred_array, bins=2, edgecolor="black", alpha=0.7)
        plt.xticks([0, 1], labels=["Class 0", "Class 1"])
        plt.xlabel("Predicted Class")
        plt.ylabel("Count")
        plt.title("Distribution of LSTM Predictions")
        plt.show()
        
        return jsonify({"predictions": predicted_classes})  # Return JSON response

    except Exception as e:
        print(f"Training failed: {str(e)}")
        raise