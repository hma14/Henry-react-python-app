import io
import base64
import seaborn as sns
import matplotlib.pyplot as plt
from matplotlib.ticker import FormatStrFormatter

def plot_seaborn(X_new, number_range, width=12, height=6):

    # Seaborn theme (optional but recommended)
    sns.set_theme(style="whitegrid")

    # Create figure and axis (still Matplotlib)
    fig, ax = plt.subplots(figsize=(width, height))

    # Seaborn bar plot
    sns.barplot(
        data=X_new,
        x="Number",
        y="Probability",
        color="blue",
        alpha=0.5,
        ax=ax
    )

    # Labels & title (Matplotlib controls)
    ax.set_xlabel(f"Lottery Number (1-{number_range})")
    ax.set_ylabel("Predicted Probability")
    ax.set_title("Predicted Probability of Each Lottery Number")
    
    ax.tick_params(axis="x", labelsize=8)
    ax.xaxis.set_major_formatter(FormatStrFormatter('%.0f'))

    # Save plot to buffer
    img_buf = io.BytesIO()
    fig.savefig(img_buf, format="png", bbox_inches="tight")
    plt.close(fig)

    img_buf.seek(0)
    return base64.b64encode(img_buf.getvalue()).decode("utf-8")
