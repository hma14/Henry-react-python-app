import pyodbc
import os
import openai
from openai import OpenAI
from collections import defaultdict
import random
from dotenv import load_dotenv
from database import *
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
        n.IsBonusNumber, n.TotalHits, n.Probability,
        1 AS NumberOfAppearing 
    FROM [dbo].[LottoTypes] t 
    INNER JOIN [dbo].[Numbers] n ON t.Id = n.LottoTypeId 
    WHERE t.LottoName = ? AND t.DrawNumber = ?
    ORDER BY n.Distance
    """

    # Connect to SQL Server
    with pyodbc.connect(connection_string) as conn:
        cursor = conn.cursor()
        cursor.execute(query, (lotto_name, draw_number))
        rows = cursor.fetchall()

        # Optional: convert result to list of dictionaries
        columns = [column[0] for column in cursor.description]
        records =  [dict(zip(columns, row)) for row in rows]
        
        # or do below to add non db property(field)
        #for record in records:
        #    record['NumberOfAppearing'] = 1
        
        far_distance = int(records[-1]["Distance"])
        hot_distance = far_distance / 5
        neutral_distance = far_distance / 3
        
        grouped = defaultdict(list)
        for row in records:
            distance = row["Distance"]
            if distance <= hot_distance :
                grouped["hot"].append(row)
            elif hot_distance < distance <= neutral_distance:
                grouped["neutral"].append(row)
            else:
                grouped["cold"].append(row)

        # Access:
        hot = grouped["hot"]
        neutral = grouped["neutral"]
        cold = grouped["cold"]
        
        hot_list = sorted(hot, key=lambda x: x['Value'], reverse=False)
        cold_list = sorted(cold, key=lambda x: x['Value'], reverse=False)
        neutral_list = sorted(neutral, key=lambda x: x['Value'], reverse=False)
        
    return hot_list, cold_list, neutral_list
        
        
def find_object_by_value(object_list, val):
    for obj in object_list:
        if obj["Value"] == val:
            return obj

def generate_draw_int(lotto_id, hot, cold, neutral, sliderMin, sliderMax):
    combo = set()
    number_hits = lotto_hit_numbers[lotto_id]
    
    hot_range = random.randint(int(sliderMin), int(sliderMax))   
    neutral_range = random.randint(hot_range, hot_range + 2) 
    
    """
    match number_hits:
        case 5: 
            hot_range = random.randint(sliderMin, sliderMax)   
            neutral_range = random.randint(hot_range + 1, hot_range + 2)         
        case 6: 
            hot_range = random.randint(2, 4)
            neutral_range = random.randint(hot_range + 1, hot_range + 2)
        case 7: 
            hot_range = random.randint(2, 5)
            neutral_range = random.randint(hot_range + 1, neutral_range + 2)
    """        
    
    while len(combo) < number_hits:
        if len(combo) < hot_range:
            combo.add(random.choice(hot)["Value"])
        elif len(combo) <= neutral_range:
            combo.add(random.choice(neutral)["Value"])
        else:
            combo.add(random.choice(cold)["Value"])
    return sorted(combo)
        
def generate_draw(lotto_id, hot, cold, neutral, sliderMin, sliderMax):
    intList = generate_draw_int(lotto_id, hot, cold, neutral, sliderMin, sliderMax)
    combo = []
    
    combo.extend(
        find_object_by_value((hot + neutral + cold), val) for val in intList
    )
        
    return sorted(combo, key=lambda x: x["Value"])


def generate_multiple_draws(lotto_id, hot, cold, neutral, count, sliderMin, sliderMax):
    return [generate_draw(lotto_id, hot, cold, neutral, sliderMin, sliderMax) for _ in range(count)]


# === AI Enhancement ===
def ask_model_to_analyze_draws(lotto_name, hot, cold, neutral, draws,ai_model, max_tokens):
     
    gptModels = ["gpt-4.1", "gpt-4-1106-preview", "gpt-4.1-mini", "gpt-4.1-nano", "o4-mini", "gpt-4o", "gpt-4o-mini", "gpt-4o-realtime-preview", "gpt-4o-mini-tts", "dall-e-3"]
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
            
    messages=[
        {"role": "system", "content": "You are a helpful assistant for predicting lottery numbers."},
        {"role": "user", "content": prompt}
    ]
    
    load_dotenv()
    
    if (ai_model == "deepseek-chat"):     
        api_key = os.getenv("DEEPSEEK_API_KEY")
        base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
        client = OpenAI(api_key=api_key, base_url=base_url)               
    elif (ai_model in  gptModels):
        api_key = os.getenv("OPENAI_API_KEY")
        client = OpenAI(api_key=api_key)
    else:
        return "AI model is missing, please choose an AI model"
    try:
        response = client.chat.completions.create(
            model=ai_model, 
            messages=messages,
            temperature=1.0,
            max_tokens=max_tokens
        )
    except Exception as e:
        print(f"Error calling AI API: {e}")

    return response.choices[0].message.content

