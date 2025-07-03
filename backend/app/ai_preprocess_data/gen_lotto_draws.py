import pyodbc
import os
from openai import OpenAI
from collections import defaultdict
import random
from dotenv import load_dotenv
from utils.database import *
import math

lotto_hit_numbers = { 
    1: 6, 
    2: 6, 
    3: 7,
    4: 5,
}

def get_lotto_data(lotto_name: int, draw_number: int):
    connection_string = get_db_connection_string()
     
    query = """
    SELECT 
        t.NumberRange, t.DrawNumber, 
        n.Value, n.Distance, n.IsHit, n.NumberofDrawsWhenHit, 
        n.IsBonusNumber, n.TotalHits, n.Probability 
    FROM [dbo].[LottoTypes] t 
    INNER JOIN [dbo].[Numbers] n ON t.Id = n.LottoTypeId 
    WHERE t.LottoName = ? AND t.DrawNumber = ?
    ORDER BY n.TotalHits DESC
    """

    # Connect to SQL Server
    with pyodbc.connect(connection_string) as conn:
        cursor = conn.cursor()
        cursor.execute(query, (lotto_name, draw_number))
        rows = cursor.fetchall()

        # Optional: convert result to list of dictionaries
        columns = [column[0] for column in cursor.description]
        records =  [dict(zip(columns, row)) for row in rows]
        most_hits = int(records[0]["TotalHits"])
        least_hits = int(records[-1]["TotalHits"])
        
        step =  (most_hits - least_hits) / 3
        
        hot_hits = most_hits - step
        cold_hits = least_hits + step
        
        
        grouped = defaultdict(list)
        for row in records:
            hits = row["TotalHits"]
            num = row["Value"]
            if hits >= hot_hits:
                grouped["hot"].append(num)
            elif cold_hits <= hits < hot_hits:
                grouped["neutral"].append(num)
            else:
                grouped["cold"].append(num)

        # Access:
        hot = grouped["hot"]
        neutral = grouped["neutral"]
        cold = grouped["cold"]
        
        
        
    return sorted(hot), sorted(cold), sorted(neutral)
        
        
        
def generate_draw(lotto_id, hot, cold, neutral):
    combo = set()
    number_hits = lotto_hit_numbers[lotto_id]
    hot_range = math.floor(number_hits / 2)
    neutral_range = hot_range + 2
    
    while len(combo) < number_hits:
        if len(combo) < hot_range:
            combo.add(random.choice(hot))
        elif len(combo) < neutral_range:
            combo.add(random.choice(neutral))
        else:
            combo.add(random.choice(cold))
    return sorted(combo)


def generate_multiple_draws(lotto_id, hot, cold, neutral, count):
    return [generate_draw(lotto_id, hot, cold, neutral) for _ in range(count)]


# === AI Enhancement ===
def ask_model_to_analyze_draws(lotto_name, hot, cold, neutral, draws):
    load_dotenv()
    api_key = os.getenv("DEEPSEEK_API_KEY")
    client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")

    prompt = f"""
            You are an AI lottery analysis assistant.

            Here are categorized numbers:
            - Hot: {hot}
            - Cold: {cold}
            - Neutral: {neutral}

            Based on this data, I generated these 5 {lotto_name} draws:
            {draws}

            Please evaluate these combinations and suggest any improvements or alternatives.
            """

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": "You are a helpful lottery assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=1.0,
        max_tokens=50
    )

    return response.choices[0].message.content