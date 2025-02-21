import matplotlib
matplotlib.use("Agg")  # Use the non-GUI Agg backend (for image generation)
import matplotlib.pyplot as plt
import os
from pathlib import Path
from flask import Flask
import base64
import io

"""
# Folder to store the generated plots
save_dir = Path(__file__).resolve().parent.parent / 'ai_preprocess_data' / 'saved_training_data'
os.makedirs(save_dir, exist_ok=True)
"""

def plot(X_new, width=12, height=6):
    
    # Create the figure
    fig, ax = plt.subplots(figsize=(width, height))

    # Bar plot
    ax.bar(X_new["Number"], X_new["Probability"], color="blue", alpha=0.7)
    ax.set_xlabel("Lottery Number (1-49)")
    ax.set_ylabel("Predicted Probability")
    ax.set_title("Predicted Probability of Each Lottery Number")

    # Save the plot to a BytesIO object
    img_buf = io.BytesIO()
    plt.savefig(img_buf, format="png", bbox_inches="tight")
    plt.close(fig)  # Close the figure to free memory

    # Encode image to base64 string
    img_buf.seek(0)

    return base64.b64encode(img_buf.getvalue()).decode("utf-8")

