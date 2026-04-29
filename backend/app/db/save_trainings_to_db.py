import json
import pickle
from db.database import *

def save_prediction_to_db(lotto_id, draw_number, version, X_new, top_hit_numbers, feature_importance, metrics):
    conn = pyodbc.connect(get_db_connection_string())
    cursor = conn.cursor()

    train_result_json = X_new.to_json(orient="records")
    top_hit_json = json.dumps(top_hit_numbers.tolist())    
    metrics_json = json.dumps(metrics) if metrics else None
    feature_importance_json = json.dumps(feature_importance) if feature_importance else None

    cursor.execute("""
        MERGE AiTrainings AS target
        USING (SELECT ? AS lotto_id, ? AS draw_number, ? AS model_version) AS source
        ON (target.lotto_id = source.lotto_id 
            AND target.draw_number = source.draw_number 
            AND target.model_version = source.model_version)
        WHEN MATCHED THEN
            UPDATE SET train_result=?, top_hit_numbers=?, updated_at=GETDATE()
        WHEN NOT MATCHED THEN
            INSERT (lotto_id, draw_number, model_version, train_result, top_hit_numbers, feature_importance, metrics)
            VALUES (?, ?, ?, ?, ?, ?, ?);
    """,
    lotto_id, draw_number, version,
    train_result_json, top_hit_json,
    lotto_id, draw_number, version, train_result_json, top_hit_json, feature_importance_json, metrics_json)

    conn.commit()
    cursor.close()
    conn.close()
