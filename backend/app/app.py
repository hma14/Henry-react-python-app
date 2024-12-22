# cSpell: disable

import os
from flask import Flask, jsonify, request
from flask_cors import CORS  # Import the CORS module
from config import Config
from openai_api import get_openai_response, get_string_response
from datetime import datetime
from sqlalchemy import and_, or_, func, desc
from sqlalchemy.orm import joinedload
from flask_sqlalchemy import SQLAlchemy
from models import db, BC49, LottoMax, Lotto649, Numbers, LottoType
from potential_draws import PotentialDraws
import json


app = Flask(__name__)

app.config.from_object(Config)

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

    lotto_data = retrieve_data(lotto_name, page_size, number_range, start_index, drawNumber)
    if lotto_data is not None:
        return jsonify(lotto_data)
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
    app.run(debug=False, host="ep.lottotry.com", port=5000)
    #app.run(debug=True, host="0.0.0.0", port=5000)
