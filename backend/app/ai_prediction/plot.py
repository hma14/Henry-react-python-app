import matplotlib.pyplot as plt

def plot(X_new, width, hight):
    plt.figure(figsize=(width, hight))
    plt.bar(X_new["DrawNumber"], X_new["Probability"], color="blue", alpha=0.7)
    plt.xlabel("Lottery Number (1-49)")
    plt.ylabel("Predicted Probability")
    plt.title("Predicted Probability of Each Lottery Number")
    plt.show()
