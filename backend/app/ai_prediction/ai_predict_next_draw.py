import joblib
import pandas as pd
import numpy as np


def predict_next_draw(pipeline, latest_draw):
    
    # Define potential lottery numbers
    lottery_numbers = np.arange(1, 50)  # 1 to 49

    # Create a DataFrame with the same features used in training
    X_new = pd.DataFrame({
        "DrawNumber": [latest_draw + 1] * len(lottery_numbers),  # Assume predicting for the next draw
        "Number":lottery_numbers,
        "NumberofDrawsWhenHit": np.random.randint(0, 15, len(lottery_numbers)),  # Example: random probabilities
        "ThompsonProb": np.random.uniform(0, 1, len(lottery_numbers)),  # Example: random probabilities
        "Distance": np.random.randint(1, 50, len(lottery_numbers)),  # Example: random distances
        "TotalDraws": np.random.randint(50, 500, len(lottery_numbers)),  # Example: past appearances
        "PrevDrawEvenCount": np.random.randint(0, 6, len(lottery_numbers)),  # Example: even numbers in previous draw
        "Temperature": np.random.uniform(10, 30, len(lottery_numbers)),  # Example: weather impact
        "WeightedHits": np.random.uniform(0, 1, len(lottery_numbers)),  # Example: adjusted frequency
        "MissStreak": np.random.randint(0, 20, len(lottery_numbers)),  # Example: streak since last hit
        "HitsLast10Draws": np.random.randint(0, 5, len(lottery_numbers)),  # Example: recent performance
        "HitsLastMonth": np.random.randint(0, 10, len(lottery_numbers)),  # Example: performance in last month
        "TotalHits": np.random.randint(10, 100, len(lottery_numbers)),  # Example: overall frequency
        "IsHit": [0] * len(lottery_numbers)  # Placeholder (not used in prediction)
    })

    print(f"pipeline.feature_names_in_ = {pipeline.feature_names_in_}")
    # Ensure features are in the correct order
    X_new = X_new[pipeline.feature_names_in_]
    
    # Get probability predictions for each number
    probs = pipeline.predict_proba(X_new)[:, 1]  # Probability of being a "hit"

    # Add probabilities to the DataFrame
    X_new["Probability"] = probs

    # Sort by highest probability and select top numbers
    top_hit_numbers = X_new.nlargest(12, "Probability")["Number"].values  # Select top 6 numbers
    print("Predicted hit numbers:", top_hit_numbers)
    
    X_new.to_csv("predicted_numbers.csv", index=False)
    return top_hit_numbers
