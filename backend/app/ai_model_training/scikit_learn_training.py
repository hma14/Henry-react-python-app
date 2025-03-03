import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib  # For saving the model
from pathlib import Path


def train_scikit_learn_model(X_train, X_test, y_train, y_test, model_to_be_saved):

    # Initialize the model (Random Forest Classifier)
    model = RandomForestClassifier(
        n_estimators=100,  # Number of decision trees
        random_state=42,   # Seed for reproducibility
        class_weight='balanced'  # Handle class imbalance (if any)
    )

    X_train = X_train.iloc[:len(y_train)]
    
    # Train the model
    model.fit(X_train, y_train.values.ravel())  # .ravel() to flatten y_train if needed

    # Predict on the test set
    y_pred = model.predict(X_test)

    # Evaluate the model
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    # Save the trained model for future use
    joblib.dump(model, model_to_be_saved)

    # Example: Predict probabilities for the next draw
    # Load the latest data (replace with your actual data)
    latest_data = X_train.iloc[-1:]  # Example: Use the last row of training data
    probabilities = model.predict_proba(latest_data)[:, 1]  # Probability of "IsHit = True"

    #print(len(X_train['Number'].values))  # Number of feature columns
    #print(len(probabilities))
    
    #print(X_train['Number'])
    
    print(probabilities.shape, latest_data.shape)

    # Map probabilities to numbers (1-49)
    number_probabilities = pd.DataFrame({
        'Number': latest_data['Number'].values,  #X_train['Number'].values,  # Replace with actual feature names if needed
        'Probability': probabilities
    })

    # Sort by probability (descending)
    
    #top_numbers = number_probabilities.sort_values(by='Probability', ascending=False).reset_index(drop=True) # drop index in output
    # or drop index in printout as below
    # print("\nTop Predicted Numbers for Next Draw:\n", top_numbers.head(10).to_string(index=False))

    top_numbers = number_probabilities.sort_values(by='Probability', ascending=False)
    """ 
    print('-----------------')
    print(model.predict_proba(latest_data))
    print("\nTop Predicted Numbers for Next Draw:\n", top_numbers.head(10))
    """    
    
    return top_numbers