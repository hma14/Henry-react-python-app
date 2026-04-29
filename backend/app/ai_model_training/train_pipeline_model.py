import pandas as pd
import numpy as np

def train_pipeline_model(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    config: dict
):
    """
    TRAINING ONLY
    - Uses SMOTE
    - Performs CV
    - Returns a PREDICT pipeline (NO SMOTE)
    """

    from imblearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler
    from sklearn.ensemble import RandomForestClassifier
    from imblearn.over_sampling import SMOTE
    from sklearn.model_selection import TimeSeriesSplit
    from sklearn.metrics import (
        accuracy_score, precision_score, recall_score, roc_auc_score
    )

    # -------------------------------
    # 1. Feature validation
    # -------------------------------
    required_features = [
        'Number',
        'HitsLastMonth',
        'MissStreak',
        'MissStreak_RollingMean',
        'MissStreak_RollingStd',
        'MissStreak_RollingSum',
        'ThompsonProb'
    ]

    if missing := [f for f in required_features if f not in X_train.columns]:
        raise ValueError(f"Missing critical features: {missing}")

    # -------------------------------
    # 2. Prepare data
    # -------------------------------
    X_train = X_train[required_features]
    y_train = y_train.values.ravel()

    tscv = TimeSeriesSplit(n_splits=5, test_size=10)

    metrics = {
        "accuracy": [],
        "roc_auc": [],
        "precision": [],
        "recall": []
    }

    # -------------------------------
    # 3. TRAINING pipeline (with SMOTE)
    # -------------------------------
    train_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('smote', SMOTE(random_state=42)),
        ('classifier', RandomForestClassifier(
            class_weight=config.get('class_weight'),
            n_estimators=config.get('n_estimators') or 100,
            max_depth=config.get('max_depth'),
            random_state=config.get('random_state')
        ))
    ])

    # -------------------------------
    # 4. Time-series validation
    # -------------------------------
    for train_idx, val_idx in tscv.split(X_train):
        X_tr, X_val = X_train.iloc[train_idx], X_train.iloc[val_idx]
        y_tr, y_val = y_train[train_idx], y_train[val_idx]

        train_pipeline.fit(X_tr, y_tr)

        y_proba = train_pipeline.predict_proba(X_val)[:, 1]
        y_pred = (y_proba > 0.6).astype(int)

        metrics["accuracy"].append(accuracy_score(y_val, y_pred))
        metrics["precision"].append(precision_score(y_val, y_pred, zero_division=1))
        metrics["recall"].append(recall_score(y_val, y_pred, zero_division=1))

        if len(set(y_val)) < 2:
            metrics["roc_auc"].append(None)
        else:
            metrics["roc_auc"].append(roc_auc_score(y_val, y_proba))

    # -------------------------------
    # 5. Final training on ALL data
    # -------------------------------
    train_pipeline.fit(X_train, y_train)

    # -------------------------------
    # 6. Build INFERENCE pipeline (NO SMOTE)
    # -------------------------------
    predict_pipeline = Pipeline([
        ('scaler', train_pipeline.named_steps['scaler']),
        ('classifier', train_pipeline.named_steps['classifier'])
    ])

    # -------------------------------
    # 7. Feature importance
    # -------------------------------
    feature_importance = pd.DataFrame({
        "feature": required_features,
        "importance": predict_pipeline.named_steps[
            "classifier"
        ].feature_importances_
    }).sort_values("importance", ascending=False)

    return {
        "predict_pipeline": predict_pipeline,
        "metrics": metrics,
        "feature_importance": feature_importance.to_dict(orient="records")
    }
