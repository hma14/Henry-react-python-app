import pandas as pd
import numpy as np
from sklearn.model_selection import TimeSeriesSplit
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, precision_score, recall_score, roc_auc_score, accuracy_score
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from imblearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE
import joblib

def training_lottery_model(X_train, y_train, config):
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
            ('scaler', MinMaxScaler()),  # Scale only numerical features
            ('smote', SMOTE(sampling_strategy=0.5, random_state=42)),
            ('classifier', RandomForestClassifier(
                class_weight=config.get('class_weight'),
                n_estimators=config.get('n_estimators'),
                max_depth=config.get('max_depth'),
                random_state=config.get('random_state')            
            ))
        ])
        
        # 3. Feature Validation
        required_features = ['Distance', 'HitsLast10Draws', 'MissStreak', 'Temperature', 
                            'PrevDrawEvenCount', 'HitsLastMonth', 'WeightedHits', 'ThompsonProb']
        
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

            pipeline.fit(X_fold_train, y_fold_train)
            
            # Validate on next temporal chunk
            y_pred = pipeline.predict(X_val)
            y_proba = pipeline.predict_proba(X_val)[:, 1]
            
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