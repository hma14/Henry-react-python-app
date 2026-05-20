import pandas as pd
import json
import pickle
from db.database import *
from io import StringIO
def get_prediction_from_db(lotto_id, draw_number, version, training_type):
    conn = pyodbc.connect(get_db_connection_string())
    cursor = conn.cursor()

    cursor.execute("""
        SELECT train_result, top_hit_numbers, metrics, feature_importance, training_type
        FROM AiTrainings
        WHERE lotto_id=? AND draw_number=? AND model_version=? AND training_type=?;
    """, lotto_id, draw_number, version, training_type)

    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row:
        return None, None, None, None
    
    python_obj = json.loads(row[0])
    X_new = pd.DataFrame(python_obj)
    
    # or using below
    #X_new = pd.read_json(StringIO(row[0]))
    
    top_hit_numbers = json.loads(row[1])
    metrics = json.loads(row[2]) if row[2] else None
    feature_importance = json.loads(row[3]) if row[3] else None

    return X_new, top_hit_numbers, metrics, feature_importance
