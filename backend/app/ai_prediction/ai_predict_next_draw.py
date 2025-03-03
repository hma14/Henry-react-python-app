import joblib
import pandas as pd
import numpy as np


def predict_next_draw(pipeline, latest_draw):
    
    # Define potential lottery numbers
    lottery_numbers = np.arange(1, 50)  # 1 to 49

    # Create a DataFrame with the same features used in training
    X_new = pd.DataFrame({
        "DrawNumber": [latest_draw + 1] * len(lottery_numbers),
        "Number": lottery_numbers, 
        "Distance_Boiling": np.random.randint(0, 1, len(lottery_numbers)), 
        "Distance_Hot": np.random.randint(0, 1, len(lottery_numbers)), 
        "Distance_Normal":np.random.randint(0, 1, len(lottery_numbers)), 
        "Distance_Cold": np.random.randint(0, 1, len(lottery_numbers)),  # Example: random probabilities
        "Distance_Freezing": np.random.uniform(0, 1, len(lottery_numbers)),  # Example: random probabilities
        "MissStreak_RollingMean": np.random.randint(0, 1, len(lottery_numbers)),  # Example: random distances
        "MissStreak_RollingStd": np.random.randint(0, 1, len(lottery_numbers)),  # Example: past appearances
        "MissStreak_RollingSum": np.random.randint(0, 10, len(lottery_numbers)),  # Example: even numbers in previous draw
        "HitsLastMonth": np.random.randint(1, 8, len(lottery_numbers)),  # Example: even numbers in previous draw
        "MissStreak": np.random.randint(0, 1, len(lottery_numbers)),  # Example: even numbers in previous draw
        "ThompsonProb": np.random.randint(0, 1, len(lottery_numbers)),  # Example: even numbers in previous draw
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
    return X_new, top_hit_numbers
