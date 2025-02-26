# cSpell: disable

import sys
import os
import joblib
import json
import pandas as pd
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS   # Import the CORS module
from config import Config
from openai_api import get_openai_response, get_string_response
from datetime import datetime
from sqlalchemy import and_, or_, func, desc 
from sqlalchemy.orm import joinedload
from flask_sqlalchemy import SQLAlchemy 
from models import db, BC49, LottoMax, Lotto649, Numbers, LottoType
from potential_draws import PotentialDraws
from pathlib import Path
from ai_preprocess_data.data_preprocess import preprocess_data
from ai_model_training.scikit_learn_training import train_scikit_learn_model
from ai_model_training.train_ai_model_LSTM import training_LSTM_model 
from ai_prediction.ai_predict_next_draw import predict_next_draw
from ai_model_training.train_ai_model_Pipeline import training_lottery_model_Pipeline
from utils.database import Database
from ai_prediction.plot import plot


sys.path.append(os.path.abspath(os.path.dirname(__file__)))
#print(sys.path)


app = Flask(__name__)

app.config.from_object(Config)

PLOT_FOLDER = "static/plots"

# frontend url: http://ai.lottotry.com
# CORS(app, resources={r"/api/*": {"origins": "http://ai.lottotry.com"}})

# Load configuration based on environment variable
config_mode = os.getenv("FLASK_ENV", "development")
if config_mode == "production":
    app.config.from_object("config_prod.Config")
else:
    app.config.from_object("config_dev.Config")
CORS(app)


db.init_app(app)

@app.route("/api/predict_next_draw", methods=["GET"])
def ai_predict_next_draw():
    model = joblib.load("lotto_prediction_model.pkl")  # Load the model 
    
    db = Database()
    query_file = "query_latest_draw_bc49.sql"
    df = db.fetch_data(query_file)    
    db.close()
    latest_draw = df["DrawNumber"].values[0] 
    metrics, feature_importance_json, X_new, top_hit_numbers = training_lottery_model_Pipeline(model, latest_draw)
    
    # save the result to Plot image
    img_base64 = plot(X_new, width=10, height=3)
    
    return jsonify({"numbers": top_hit_numbers.tolist(), "image": img_base64, "metrics": metrics, "feature_importance": feature_importance_json}) 

@app.route("/plot",  methods=["GET"])
def get_plot():
    """
    save_dir = Path(__file__).resolve().parent / 'ai_preprocess_data' / 'saved_training_data'
    plot_path = os.path.join(save_dir, "lottery_prediction.png")
    return send_file(plot_path, mimetype="image/png")
    """

    model = joblib.load("lottery_model.pkl")  # Load the model 
    
    db = Database()
    query_file = "query_latest_draw_bc49.sql"
    df = db.fetch_data(query_file)    
    db.close()
    latest_draw = df["DrawNumber"].values[0] - 1 # temporarily
    X_new, numbers = predict_next_draw(model, latest_draw)
    
    # save the result to Plot image
    img_base64 = plot(X_new, width=10, height=3)
    
     # Send the base64 image as JSON
    return jsonify({"numbers": numbers.tolist(), "image": img_base64})

@app.route("/api/train_lottery_model", methods=["GET"])
def train_lottery_model():
    
    # Load the preprocessed data
    saved_dir = Path(__file__).resolve().parent /  'ai_preprocess_data' / 'saved_training_data'
    X_train_path = saved_dir / 'X_train.csv'
    if X_train_path.exists():
        X_train = pd.read_csv(X_train_path)

    X_test_path = saved_dir / 'X_test.csv'
    if X_test_path.exists():
        X_test = pd.read_csv(X_test_path)


    y_train_path = saved_dir / 'y_train.csv'
    if y_train_path.exists():
        y_train = pd.read_csv(y_train_path)

    y_test_path = saved_dir / 'y_test.csv'
    if y_test_path.exists():
        y_test = pd.read_csv(y_test_path)

    model_config = {
        'class_weight': 'balanced_subsample',
        'n_estimators': 200,
        'max_depth': 10,
        'sampling_ratio': 0.5
    }
    
    # Train the model
    metrics, feature_importance_json, X_new, top_hit_numbers = training_lottery_model_Pipeline(
        X_train, 
        y_train, 
        model_config
    )
    
    img_base64 = plot(X_new, width=10, height=3)
    
    return jsonify({"numbers": top_hit_numbers.tolist(), "image": img_base64, "metrics": metrics, "feature_importance": feature_importance_json, })     


@app.route("/lstm/plot",  methods=["GET"])
def get_lstm_plot():

    model = joblib.load("lstm_model.pkl")  # Load the model 
    
    db = Database()
    query_file = "query_latest_draw_bc49.sql"
    df = db.fetch_data(query_file)    
    db.close()
    latest_draw = df["DrawNumber"].values[0] - 1 # temporarily
    X_new, numbers = predict_next_draw(model, latest_draw)
    
    # save the result to Plot image
    img_base64 = plot(X_new, width=10, height=3)
    
     # Send the base64 image as JSON
    return jsonify({"numbers": numbers.tolist(), "image": img_base64})

    
    
@app.route("/api/preprocess_dataset", methods=["GET"])
def print_dataset():
    lotto_name = int(request.args.get("lotto_name", 1))
    to_draw_number = int(request.args.get("drawNumber", 1))
    
    return preprocess_data('feature_engineering_query.sql', lotto_name, to_draw_number)


@app.route("/api/train_scikit_learn_model", methods=["GET"])
def scikit_learn_training_model():
    # Load the preprocessed data

    saved_dir = Path(__file__).resolve().parent /  'ai_preprocess_data' / 'saved_training_data'
    X_train_path = saved_dir / 'X_train.csv'
    if X_train_path.exists():
        X_train = pd.read_csv(X_train_path)

    X_test_path = saved_dir / 'X_test.csv'
    if X_test_path.exists():
        X_test = pd.read_csv(X_test_path)


    y_train_path = saved_dir / 'y_train.csv'
    if y_train_path.exists():
        y_train = pd.read_csv(y_train_path)

    y_test_path = saved_dir / 'y_test.csv'
    if y_test_path.exists():
        y_test = pd.read_csv(y_test_path)

    df = train_scikit_learn_model(X_train, X_test, y_train, y_test, 'lotto_prediction_model.pkl') # call train_scikit_learn_model
    
    # Convert DataFrame to JSON
    response = {
        "numbers": df["Number"].tolist(),
        "probabilities": df["Probability"].tolist()
    }
    
    return jsonify(response)

@app.route("/api/lstm_predict_next_draw", methods=["GET"])
def train_LSTM_model():
    # Load the preprocessed data
    saved_dir = Path(__file__).resolve().parent /  'ai_preprocess_data' / 'saved_training_data'
    X_train_path = saved_dir / 'X_train.csv'
    if X_train_path.exists():
        X_train = pd.read_csv(X_train_path)

    X_test_path = saved_dir / 'X_test.csv'
    if X_test_path.exists():
        X_test = pd.read_csv(X_test_path)


    y_train_path = saved_dir / 'y_train.csv'
    if y_train_path.exists():
        y_train = pd.read_csv(y_train_path)

    y_test_path = saved_dir / 'y_test.csv'
    if y_test_path.exists():
        y_test = pd.read_csv(y_test_path)
    
    # Train the model
    return training_LSTM_model(
        X_train, 
        X_test,
        y_train, 
        y_test
    )
    


@app.route("/api/lotto/allNumbers", methods=["GET"])
def get_data_4():
    lotto_name = int(request.args.get("lotto_name", 1))
    number_range = get_lotto_number_range(lotto_name)

    page_size = int(request.args.get("page_size", 10))
    page_number = int(request.args.get("page_number", 1))
    drawNumber = int(request.args.get("drawNumber", 1))

    if drawNumber == 1:
        drawNumber = get_target_draw_number(lotto_name)
    start_index = (page_number - 1) * page_size

    lotto_data = retrieve_data(
        lotto_name, page_size, number_range, start_index, drawNumber
    )
    if lotto_data is not None:
        return lotto_data
    else:
        return "Error on calling get_data_4 (allNumbers)"


@app.route("/api/lotto/predict", methods=["GET"])
def get_data_5():
    lotto_name = int(request.args.get("lotto_name", 1))
    number_range = get_lotto_number_range(lotto_name)
    drawNumber = int(request.args.get("drawNumber", 1))
    page_size = 1
    start_index = 0
    return retrieve_data(lotto_name, page_size, number_range, start_index, drawNumber)


@app.route("/api/openai", methods=["GET"])
def get_from_openai():
    # below will call openai web api
    # response_string = get_openai_response()

    # return simply strings

    return get_string_response()


@app.route("/api/lotto/potential_draws", methods=["POST"])
def potential_draws():
    lotto_name = int(request.args.get("lotto_name", 1))
    number_range = get_lotto_number_range(lotto_name)
    page_size = int(request.args.get("page_size", 10))
    drawNumber = int(request.args.get("drawNumber"))

    if drawNumber == 1:
        drawNumber = get_target_draw_number(lotto_name)

    total_page_size = 200
    start_index = 0

    result = retrieve_data(
        lotto_name, total_page_size, number_range, start_index, drawNumber
    )

    # Decode the byte string to a regular string
    json_str = result.data.decode("utf-8")

    # Parse the JSON string
    parsed_data = json.loads(json_str)

    # Access the 'data' key, which contains an array
    numbers = parsed_data["data"]
    columns = int(request.args.get("columns"))

    potential_draws = PotentialDraws(numbers, columns, page_size)

    data = potential_draws.next_potential_draws()
    for da in data:
        for d in da:
            d["NumberOfAppearing"] = 1

    return [arr for arr in data if arr]


@app.route("/api/lotto/lottoDraws", methods=["GET"])
def get_data_7():
    lotto_name = int(request.args.get("lotto_name", 1))
    number_range = get_lotto_number_range(lotto_name)
    page_size = int(request.args.get("page_size", 10))
    page_number = int(request.args.get("page_number", 1))
    drawNumber = int(request.args.get("drawNumber"))
    print(f"drawNumber = {drawNumber}")
    if drawNumber == 1:
        drawNumber = get_target_draw_number(lotto_name)

    # Calculate the start and end indices for the current page
    start_index = (page_number - 1) * page_size
    return retrieve_data(lotto_name, page_size, number_range, start_index, drawNumber)


@app.route("/api/lotto/numberDraws", methods=["GET"])
def get_data_8():
    lotto_name = int(request.args.get("lotto_name", 1))
    number_range = get_lotto_number_range(lotto_name)
    page_size = int(request.args.get("page_size", 10))
    page_number = int(request.args.get("page_number", 1))
    drawNumber = int(request.args.get("drawNumber"))
    print(f"drawNumber = {drawNumber}")
    if drawNumber == 1:
        drawNumber = get_target_draw_number(lotto_name)

    # Calculate the start and end indices for the current page
    start_index = (page_number - 1) * page_size
    return retrieve_data(lotto_name, page_size, number_range, start_index, drawNumber)


def get_lotto_number_range(lotto_name):
    if lotto_name in [1, 2, 4]:
        return 49
    elif lotto_name == 3:
        return 50

    else:
        return 7  # for DailyGrand_GrandNumber


@app.route("/api/lotto/getCurrentDrawNumber", methods=["GET"])
def get_current_draw_number():
    lotto_name = int(request.args.get("lotto_name", 1))
    da = get_target_draw_number(lotto_name)

    return jsonify({"drawNumber": da})


def retrieve_data(lotto_name, page_size, number_range, start_index, drawNumber):
    if not (
        data := (
            Numbers.query.join(LottoType, LottoType.Id == Numbers.LottoTypeId)
            .filter(
                LottoType.LottoName == lotto_name, LottoType.DrawNumber <= drawNumber
            )
            .options(joinedload(Numbers.LottoType))
            .order_by(desc(LottoType.DrawNumber))
            .limit(page_size * number_range)
            .offset(start_index)
            .all()
        )
    ):
        return jsonify({"message": "No data found"})

    numbers_dict = {}
    drawNumber_dict = {}
    drawDate_dict = {}

    for number in data:
        if number.LottoType.DrawNumber not in numbers_dict:
            numbers_dict[number.LottoType.DrawNumber] = []
        numbers_dict[number.LottoType.DrawNumber].append(
            {
                "Value": number.Value,
                "Distance": number.Distance,
                "IsHit": number.IsHit,
                "NumberOfDrawsWhenHit": number.NumberOfDrawsWhenHit,  # The line ` "IsBonusNumber":
                "IsBonusNumber": number.IsBonusNumber,
                "TotalHits": number.TotalHits,
                "Probability": number.Probability,
                "NumberOfAppearing": 0,
            }
        )
        if len(numbers_dict[number.LottoType.DrawNumber]) == number_range:
            if number.LottoType.DrawNumber not in drawNumber_dict:
                drawNumber_dict[number.LottoType.DrawNumber] = []
            drawNumber_dict[number.LottoType.DrawNumber] = number.LottoType.DrawNumber

            if number.LottoType.DrawNumber not in drawDate_dict:
                drawDate_dict[number.LottoType.DrawNumber] = []
            drawDate_dict[number.LottoType.DrawNumber] = number.LottoType.DrawDate

    result_list = []

    for key, value_ in drawNumber_dict.items():
        value = drawNumber_dict.get(key)
        if value is None:
            break
        result_list.append(
            {
                "DrawNumber": value_,
                "DrawDate": drawDate_dict[key].strftime("%Y-%m-%d"),
                "Numbers": numbers_dict[key],
            }
        )

    sorted_list = sorted(result_list, key=lambda x: x["DrawNumber"], reverse=True)
    sorted_result_list = [
        {
            "DrawNumber": entry["DrawNumber"],
            "DrawDate": entry["DrawDate"],
            "Numbers": sorted(
                entry["Numbers"], key=lambda x: x["Value"], reverse=False
            ),
        }
        for entry in sorted_list
    ]

    return jsonify({"data": sorted_result_list})


def get_target_draw_number(lotto_name):
    last_draw = (
        LottoType.query.join(
            Numbers, Numbers.LottoTypeId == LottoType.Id
        )  # Adjust the join condition based on your actual model
        .filter(LottoType.LottoName == lotto_name)
        .options(
            joinedload(LottoType.numbers)
        )  # Adjust based on your actual relationships
        .order_by(desc(LottoType.DrawNumber))
        .first()
    )
    return last_draw.DrawNumber


if __name__ == "__main__":
    # app.run(debug=app.config['DEBUG'], host=app.config['HOST'], port=app.config['PORT'])
    # app.run(debug=False, host="ep.lottotry.com", port=5000)
    app.run(debug=True, host="0.0.0.0", port=5001)
