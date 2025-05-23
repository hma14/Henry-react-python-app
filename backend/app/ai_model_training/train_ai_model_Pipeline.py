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


def training_lottery_model_Pipeline(X_train, y_train, config):
    # cSpell:ignore tscv, iloc, proba, importances
    try:
        tscv = TimeSeriesSplit(n_splits=5, test_size=10)
        
        pipeline = Pipeline([
            ('scaler', StandardScaler()),  # Scale only numerical features
            ('smote', SMOTE(random_state=42)),
            ('classifier', RandomForestClassifier(
                class_weight=config.get('class_weight'),
                n_estimators=config.get('n_estimators'),
                max_depth=config.get('max_depth'),
                random_state=config.get('random_state')            
            ))
        ])
        
        # 3. Feature Validation
        required_features = [ 'Number', 'HitsLastMonth', 'MissStreak', 'MissStreak_RollingMean', 'MissStreak_RollingStd', 'MissStreak_RollingSum', 'ThompsonProb' ] 
        
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

            pipeline.fit(X_train, y_train.values.ravel())
            
            # Validate on next temporal chunk
            # y_pred = pipeline.predict(X_val)
            y_proba = pipeline.predict_proba(X_val)[:, 1]
            y_pred = (y_proba > 0.6).astype(int)  # Only predict "hit" if probability > 70%
            
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

        # 5. Final Training
        y_train = y_train.values.ravel()        
        pipeline.fit(X_train, y_train)
        
        probs = pipeline.predict_proba(X_train)[:, 1]  # Probability of being a "hit"

        # Add probabilities to the DataFrame
        X_train["Probability"] = probs

        # This sorts by probability, gets unique numbers, and selects the top 12.
        top_hit_numbers = X_train.sort_values("Probability", ascending=False)["Number"].unique()[:12]
        
        # 6. Persist Model
        joblib.dump(pipeline, 'lottery_model.pkl')
        joblib.dump(pipeline.named_steps['scaler'], 'feature_scaler.pkl')
                
        # 7. Feature Importance
        feature_importance = pd.DataFrame({
            'feature': required_features,
            'importance': pipeline.named_steps['classifier'].feature_importances_
        }).sort_values('importance', ascending=False)

        #return pipeline, metrics, feature_importance
        # Convert feature importance to JSON format
        feature_importance_json = feature_importance.to_dict(orient="records")
        
        return metrics, feature_importance_json, X_train, top_hit_numbers

    except Exception as e:
        print(f"Training failed: {str(e)}")
        raise