import pandas as pd
import json
import pickle
from db.database import *

def get_prediction_from_db(lotto_id, draw_number, version):
    conn = pyodbc.connect(get_db_connection_string())
    cursor = conn.cursor()

    cursor.execute("""
        SELECT train_result, top_hit_numbers, metrics, feature_importance
        FROM AiTrainings
        WHERE lotto_id=? AND draw_number=? AND model_version=?;
    """, lotto_id, draw_number, version)

    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row:
        return None, None, None, None

    X_new = pd.read_json(row[0])
    top_hit_numbers = json.loads(row[1])
    metrics = json.loads(row[2]) if row[2] else None
    feature_importance = json.loads(row[3]) if row[3] else None

    return X_new, top_hit_numbers, metrics, feature_importance
