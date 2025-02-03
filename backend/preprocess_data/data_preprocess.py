import pandas as pd
import pyodbc
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import os
from pathlib import Path
from dotenv import load_dotenv

def preprocess_data(query="SELECT * FROM your_table", save_to_csv=True):
    # Load environment variables
    
    root_dir = Path(__file__).resolve()
    
    # Keep going up until you find a specific marker (e.g., `.env`, `pyproject.toml`, or `.git`)
    while root_dir.name not in ("ai.lottotry.com", "") and root_dir.parent != root_dir:
        root_dir = root_dir.parent
    load_dotenv(dotenv_path=root_dir / '.env')
    
    DB_UID = os.getenv("DB_UID")
    DB_PWD = os.getenv("DB_PWD")
    DB_SERVER = os.getenv("DB_SERVER")
    DB_NAME = os.getenv("DB_NAME")
    DB_TYPE = os.getenv("DB_TYPE")
    
    # Step 1: Load the data
    conn = pyodbc.connect(f'DRIVER={DB_TYPE};SERVER={DB_SERVER};DATABASE={DB_NAME};UID={DB_UID};PWD={DB_PWD}')
    df = pd.read_sql(query, conn)
    conn.close()
    
    # Step 2: Handle missing values
    df = df.fillna(0)
    
    # Step 3: Feature engineering
    df['IsHot'] = df['TotalHits'] > df['TotalHits'].median()
    df['IsBonusNumber'] = df['IsBonusNumber'].astype(int)
    df['IsHit'] = df['IsHit'].astype(int)
    
    # Step 4: Normalize numerical features
    scaler = StandardScaler()
    df[['Distance', 'TotalHits', 'NumberOfDrawsWhenHit']] = scaler.fit_transform(df[['Distance', 'TotalHits', 'NumberOfDrawsWhenHit']])
    
    # Step 5: Encode categorical features
    df = pd.get_dummies(df, columns=['IsHot'], drop_first=True)
    
    # Step 6: Split the data
    X = df.drop(columns=['IsHit'])
    y = df['IsHit']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Step 7: Save the preprocessed data
    if save_to_csv:
        X_train.to_csv('X_train.csv', index=False)
        X_test.to_csv('X_test.csv', index=False)
        y_train.to_csv('y_train.csv', index=False)
        y_test.to_csv('y_test.csv', index=False)
    
    return X_train, X_test, y_train, y_test
