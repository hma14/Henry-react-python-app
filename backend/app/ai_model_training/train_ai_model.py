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



lookback_window = 30 
# Convert tabular data to time-series format
def create_sequences(X, y, lookback=lookback_window):
    Xs, ys = [], []
    for i in range(len(X) - lookback):
        Xs.append(X.iloc[i:i+lookback].values)
        ys.append(y.iloc[i+lookback])
    return np.array(Xs), np.array(ys)


def training_lottery_model(X_train, X_test, y_train, y_test, config):
    """
    Trains a lottery prediction model with best practices.
    
    Args:
        X_train (pd.DataFrame): Training features
        y_train (pd.Series): Target variable (NextDrawHit)
        config (dict): Model configuration
        
    Returns:
        pipeline: Trained model pipeline
        metrics (dict): Performance metrics
    """
    # cSpell:ignore tscv, iloc, proba, importances
    try:
        # 1. Temporal Cross-Validation
        # The line `tscv = TimeSeriesSplit(n_splits=5)` is creating a TimeSeriesSplit object with 5
        # splits for temporal cross-validation. TimeSeriesSplit is a cross-validator that provides
        # train/test indices to split time series data. In this case, it will split the data into 5
        # consecutive folds, where each fold is used as a validation set once while the 4 remaining
        # folds form the training set. This is useful for evaluating the model's performance on
        # time-ordered data, such as in forecasting or sequential prediction tasks.
        tscv = TimeSeriesSplit(n_splits=5, test_size=10)
        
        # 2. Class Imbalance Handling
        # The `pipeline` in the `train_lottery_model` function is a sequence of data processing steps
        # followed by a machine learning model. It is used to chain multiple transformers and
        # estimators together into a single object for ease of use and reproducibility.
        pipeline = Pipeline([
            ('scaler', StandardScaler()),  # Scale only numerical features
            ('smote', SMOTE(sampling_strategy=0.5, random_state=42)),
            ('classifier', RandomForestClassifier(
                class_weight=config.get('class_weight'),
                n_estimators=config.get('n_estimators'),
                max_depth=config.get('max_depth'),
                random_state=config.get('random_state')            
            ))
        ])
        
        # 3. Feature Validation
        required_features = [ 'Distance_Boiling','Distance_Normal','Distance_Cold','Distance_Freezing', 'HitsLastMonth',
                              'MissStreak', 'MissStreak_RollingMean', 'MissStreak_RollingStd', 'MissStreak_RollingSum' ] 
        
        if missing := [f for f in required_features if f not in X_train.columns]:
            raise ValueError(f"Missing critical features: {missing}")

        # 4. Temporal Training
        metrics = {'accuracy': [], 'roc_auc': [], 'precision': [], 'recall': []}
        
        min_length = min(len(X_train), len(y_train))
        X_train = X_train.iloc[:min_length]
        y_train = y_train.iloc[:min_length]
        
        for train_index, val_index in tscv.split(X_train):
            
            if max(val_index) >= len(y_train):  # Ensure val_index is within bounds
                continue  # Skip this split
                           
            
            X_fold_train, X_val = X_train.iloc[train_index], X_train.iloc[val_index]
            y_fold_train, y_val = y_train.iloc[train_index], y_train.iloc[val_index]
            
            y_fold_train = y_fold_train.values.ravel()
            y_val = y_val.values.ravel()

            # Default batch size is batch_size=32, but you can experiment with 64 or 128.
            #pipeline.fit(X_train, y_train, batch_size=64, epochs=20, validation_data=(X_val, y_val)) 
            pipeline.fit(X_train, y_train)
            
            # Validate on next temporal chunk
            # y_pred = pipeline.predict(X_val)
            y_proba = pipeline.predict_proba(X_val)[:, 1]
            y_pred = (y_proba > 0.5).astype(int)  # Only predict "hit" if probability > 70%
            
             # Only compute AUC if both classes exist in y_val
            if len(set(y_val)) < 2:
                metrics['roc_auc'].append(None)
            else:
                metrics['roc_auc'].append(roc_auc_score(y_val, y_proba))

            # Track metrics
            metrics['accuracy'].append(accuracy_score(y_val, y_pred))
            #metrics['roc_auc'].append(roc_auc_score(y_val, y_proba))
            metrics['precision'].append(precision_score(y_val, y_pred, zero_division=1))
            metrics['recall'].append(recall_score(y_val, y_pred, zero_division=1))


        # Use Focal Loss (handles extreme imbalance better):
        # LightGBM is trained for binary classification (hit or miss).
        
        """     
        LightGBM (LGBMClassifier) handles structured/tabular data well.
        LSTM (Recurrent Neural Network) captures temporal (time-dependent) patterns in the lottery draws.
        Class weighting & Focal Loss help deal with imbalance (since lottery hits are rare).
        Combining both models could allow you to compare traditional ML with deep learning and find the best approach.
        """  

        # Train LightGBM Model  
        lgbm_model = LGBMClassifier(
            objective='binary',
            class_weight={0:1, 1:15},  # Since most numbers don’t hit, the dataset is imbalanced. 
                                    # This assigns a weight of 1 to "misses" (0) and 10 to "hits" (1), 
                                    # forcing the model to focus more on predicting rare "hits".
            metric='auc'               # Uses Area Under the Curve (AUC) for performance evaluation, 
                                    # which is useful for imbalanced datasets.
        )
        print(X_train.shape, y_train.shape)
        lgbm_model.fit(X_train, y_train)
        y_pred_lgbm = lgbm_model.predict(X_test)
        
        # Evaluate
        accuracy = accuracy_score(y_test, y_pred_lgbm)
        auc = roc_auc_score(y_test, y_pred_lgbm)
        print(f"LGBM Accuracy: {accuracy:.4f}, AUC: {auc:.4f}")
        
                # Use the last 10 draws to predict the next one, It learns patterns from past 10 draws (lookback_window).    
        n_features = X_train.shape[1]  #  Gets the number of input features (e.g., Distance, HitsLast10Draws, Temperature, etc.).
        
        X_train_seq, y_train_seq = create_sequences(X_train, y_train)
        X_test_seq, y_test_seq = create_sequences(X_test, y_test)
        
        lstm_model = Sequential([           # Defines a sequential neural network model.
            LSTM(64, input_shape=(lookback_window, n_features)),  # Adds an LSTM layer with 64 memory units.
            Dense(1, activation='sigmoid')  # A single neuron output with a sigmoid activation function,
                                            # Output is a probability (between 0 and 1), predicting the likelihood of a number hitting in the next draw.
        ])
        
        optimizer = Adam(learning_rate=0.0001)  # Default: 0.001 (try 0.0005 or 0.0001 if unstable)
        lstm_model.compile(optimizer=optimizer, loss="binary_crossentropy", metrics=["accuracy"])
        #lstm_model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
        
        # Train LSTM
        #lstm_model.fit(X_train_seq, y_train_seq, epochs=20, batch_size=64, validation_data=(X_test_seq, y_test_seq))
        early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
        lstm_model.fit(X_train, y_train, epochs=50, validation_data=(X_val, y_val), callbacks=[early_stop])


        
        # Predictions
        y_pred_lstm = (lstm_model.predict(X_test_seq) > 0.5).astype(int)

        # Evaluate
        accuracy_lstm = accuracy_score(y_test_seq, y_pred_lstm)
        auc_lstm = roc_auc_score(y_test_seq, y_pred_lstm)
        print(f"LSTM Accuracy: {accuracy_lstm:.4f}, AUC: {auc_lstm:.4f}")
        
        
        # Compare Performance
        print(f"LightGBM: Accuracy={accuracy:.4f}, AUC={auc:.4f}")
        print(f"LSTM: Accuracy={accuracy_lstm:.4f}, AUC={auc_lstm:.4f}")


        # 5. Final Training
        y_train = y_train.values.ravel()        
        pipeline.fit(X_train, y_train)
        
        # 6. Persist Model
        joblib.dump(pipeline, 'lottery_model.pkl')
        joblib.dump(pipeline.named_steps['scaler'], 'feature_scaler.pkl')

        # 7. Feature Importance
        feature_importance = pd.DataFrame({
            'feature': X_train.columns,
            'importance': pipeline.named_steps['classifier'].feature_importances_
        }).sort_values('importance', ascending=False)

        #return pipeline, metrics, feature_importance
        # Convert feature importance to JSON format
        feature_importance_json = feature_importance.to_dict(orient="records")
        
        return metrics, feature_importance_json, pipeline

    except Exception as e:
        print(f"Training failed: {str(e)}")
        raise