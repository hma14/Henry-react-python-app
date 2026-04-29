import pandas as pd

def predict_lottery_draw(
    predict_pipeline,
    X_new: pd.DataFrame,
    top_k: int = 12
):
    """
    INFERENCE ONLY
    - No SMOTE
    - No training
    """

    X_new = X_new.copy()

    probs = predict_pipeline.predict_proba(X_new)[:, 1]
    X_new["Probability"] = probs

    top_hit_numbers = (
        X_new.sort_values("Probability", ascending=False)["Number"]
        .unique()[:top_k]
    )

    return X_new, top_hit_numbers
