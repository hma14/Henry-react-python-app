import pandas as pd
import pyodbc
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import os
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from datetime import datetime

def preprocess_data(query, lotto_name, drawDate, save_to_csv=True):
    
    date_obj = datetime.strptime(drawDate, "%Y-%m-%d").date()
   
    
    if query == "":
        query = """
        select lt.DrawNumber, 
        FORMAT(lt.DrawDate, 'yyy-MM-dd') as drawDate, 
        nu.Value as Number, 
        nu.Distance, nu.IsHit, 
        nu.NumberofDrawsWhenHit, 
        nu.IsBonusNumber, 
        nu.TotalHits

        from [dbo].[LottoTypes] as lt 
        inner join [dbo].[Numbers] as nu on lt.Id = nu.LottoTypeId
        where lt.LottoName = ? and lt.DrawDate > ?
        order by lt.DrawNumber DESC, nu.Value ASC
        """

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
    """     
    cursor = conn.cursor
    cursor.execute(query, (lotto_name, drawDate))
    """    
    df = pd.read_sql(query, conn, params=[lotto_name, drawDate])
    
    #cursor.close()
    conn.close()
    
    # Step 2: Handle missing values
    df = df.fillna(0)
    
    # Step 3: Feature engineering
    #df['IsHot'] = df['TotalHits'] > df['TotalHits'].median()
    df['IsHot'] = (df['Distance'] <= 10) & (df['IsHit'] == 0)
    """     
    df['IsBonusNumber'] = df['IsBonusNumber'].astype(int)
    df['IsHit'] = df['IsHit'].astype(int)
    """    
    # Step 4: Normalize numerical features
    scaler = StandardScaler()
    df[['Distance', 'TotalHits', 'NumberofDrawsWhenHit']] = scaler.fit_transform(df[['Distance', 'TotalHits', 'NumberofDrawsWhenHit']])
    
    # Step 5: Encode categorical features
    df = pd.get_dummies(df, columns=['IsHot'], drop_first=True)
    
    # Step 6: Split the data
    X = df.drop(columns=['IsHit'])
    y = df['IsHit']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=False)
    
    # Step 7: Save the preprocessed data
    if save_to_csv:
        try:
            save_dir = Path(__file__).resolve().parent / 'saved_training_data'
            os.makedirs(save_dir, exist_ok=True)  
            
            X_train_path = os.path.join(save_dir, "X_train.csv")
            X_train.to_csv(X_train_path, index=False)
            
            X_test_path = os.path.join(save_dir, "X_test.csv")
            X_test.to_csv(X_test_path, index=False)
            
            y_train_path = os.path.join(save_dir, "y_train.csv")
            y_train.to_csv(y_train_path, index=False)
            
            y_test_path = os.path.join(save_dir, "y_test.csv")
            y_test.to_csv(y_test_path, index=False)
            
            print("File saved successfully!")
        except Exception as e:
            print("Error while saving: ", e)
    """     
    return jsonify({
        "X_train": X_train.to_json(orient="records"),
        "X_test": X_test.to_json(orient="records"),
        "y_train": y_train.to_json(orient="records"),
        "y_test": y_test.to_json(orient="records")
    })
    """    
    
    html = f"""
    <h2>X_train</h2> {X_train.to_html()}
    <h2>X_test</h2> {X_test.to_html()}
    <h2>y_train</h2> {y_train.to_frame().to_html()}
    <h2>y_test</h2> {y_test.to_frame().to_html()}
    """
    return html
