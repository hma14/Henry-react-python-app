from flask import Flask, jsonify, request
from flask_cors import CORS  # Import the CORS module
from config import Config
from openai_api import get_openai_response, get_string_response
from datetime import datetime
from sqlalchemy import and_, or_, func, desc
from sqlalchemy.orm import joinedload

from models import db, BC49, LottoMax, Lotto649, Numbers, LottoType
from predict_draw import next_predict_draw
import json


app = Flask(__name__)

app.config.from_object(Config)

CORS(app)  # Enable CORS for all routes

db.init_app(app)



@app.route("/api/lotto/bc49", methods=["GET"])
def get_data_1():
    data = BC49.query.all()

    if data:
        # Convert data to a JSON format that suits your needs
        result = [
            {
                "DrawNumber": entry.DrawNumber,
                "DrawDate": entry.DrawDate.strftime("%Y-%m-%d"),
                "Number1": entry.Number1,
                "Number2": entry.Number2,
                "Number3": entry.Number3,
                "Number4": entry.Number4,
                "Number5": entry.Number5,
                "Number6": entry.Number6,
                "Bonus": entry.Bonus,
            }
            for entry in data
        ]

        # Sort 'Number1' through 'Number6' within each dictionary in 'result'
        for entry in result:
            entry.update(
                {
                    key: value
                    for key, value in sorted(
                        entry.items(),
                        key=lambda x: int(x[0].split("Number")[1])
                        if "Number" in x[0] and x[0].split("Number")[1].isdigit()
                        else float("inf"),
                    )
                }
            )

        sorted_object_list = sorted(result, key=lambda x: x["DrawNumber"], reverse=True)

        return jsonify({"data": sorted_object_list})
    else:
        return jsonify({"message": "No data found"})


@app.route("/api/lotto/lotto649", methods=["GET"])
def get_data_2():
    data = Lotto649.query.all()

    if data:
        # Convert data to a JSON format that suits your needs
        result = [
            {
                "DrawNumber": entry.DrawNumber,
                "DrawDate": entry.DrawDate.strftime("%Y-%m-%d"),
                "Number1": entry.Number1,
                "Number2": entry.Number2,
                "Number3": entry.Number3,
                "Number4": entry.Number4,
                "Number5": entry.Number5,
                "Number6": entry.Number6,
                "Bonus": entry.Bonus,
            }
            for entry in data
        ]

        # Sort 'Number1' through 'Number6' within each dictionary in 'result'
        for entry in result:
            entry.update(
                {
                    key: value
                    for key, value in sorted(
                        entry.items(),
                        key=lambda x: int(x[0].split("Number")[1])
                        if "Number" in x[0] and x[0].split("Number")[1].isdigit()
                        else float("inf"),
                    )
                }
            )

        sorted_object_list = sorted(result, key=lambda x: x["DrawNumber"], reverse=True)

        return jsonify({"data": sorted_object_list})
    else:
        return jsonify({"message": "No data found"})


@app.route("/api/lotto/lottomax", methods=["GET"])
def get_data_3():
    data = LottoMax.query.all()

    if data:
        # Convert data to a JSON format that suits your needs
        result = [
            {
                "DrawNumber": entry.DrawNumber,
                "DrawDate": entry.DrawDate.strftime("%Y-%m-%d"),
                "Number1": entry.Number1,
                "Number2": entry.Number2,
                "Number3": entry.Number3,
                "Number4": entry.Number4,
                "Number5": entry.Number5,
                "Number6": entry.Number6,
                "Number7": entry.Number7,
                "Bonus": entry.Bonus,
            }
            for entry in data
        ]

        # Sort 'Number1' through 'Number6' within each dictionary in 'result'
        for entry in result:
            entry.update(
                {
                    key: value
                    for key, value in sorted(
                        entry.items(),
                        key=lambda x: int(x[0].split("Number")[1])
                        if "Number" in x[0] and x[0].split("Number")[1].isdigit()
                        else float("inf"),
                    )
                }
            )

        sorted_object_list = sorted(result, key=lambda x: x["DrawNumber"], reverse=True)

        return jsonify({"data": sorted_object_list})
    else:
        return jsonify({"message": "No data found"})


@app.route("/api/lotto/allnumbers", methods=["GET"])
def get_data_4():
    lotto_name = int(request.args.get("lotto_name", 1))
    number_range = get_lotto_number_range(lotto_name)

    page_size = int(request.args.get("page_size", 10))
    page_number = int(request.args.get("page_number", 1))

    # Calculate the start and end indices for the current page
    start_index = (page_number - 1) * page_size

    return retrieve_data(lotto_name, page_size, number_range, start_index)


@app.route("/api/lotto/predict", methods=["GET"])
def get_data_5():
    lotto_name = int(request.args.get("lotto_name", 1))
    number_range = get_lotto_number_range(lotto_name)
    page_size = 1
    start_index = 0
    return retrieve_data(lotto_name, page_size, number_range, start_index)


@app.route("/api/openai", methods=["GET"])
def get_from_openai():
    # response_string = get_openai_response()
    response_string = get_string_response()

    return response_string


@app.route("/api/lotto/predict_draw", methods=["POST"])
def predict_draw():

    lotto_name = int(request.args.get("lotto_name", 1))
    number_range = get_lotto_number_range(lotto_name)
    page_size = 1
    start_index = 0
    result = retrieve_data(lotto_name, page_size, number_range, start_index)
    
    # Decode the byte string to a regular string
    json_str = result.data.decode('utf-8')

    # Parse the JSON string
    parsed_data = json.loads(json_str)

    # Access the 'data' key, which contains an array
    numbers = parsed_data['data']
    columns = int(request.args.get("columns"))

    data = next_predict_draw(numbers[0]['Numbers'], columns)

    return data

@app.route("/api/lotto/lottoDraws", methods=["GET"])
def get_data_7():
    lotto_name = int(request.args.get("lotto_name", 1))
    number_range = get_lotto_number_range(lotto_name)
    page_size = int(request.args.get("page_size", 10))
    page_number = int(request.args.get("page_number", 1))

    # Calculate the start and end indices for the current page
    start_index = (page_number - 1) * page_size
    return retrieve_data(lotto_name, page_size, number_range, start_index)

@app.route("/api/lotto/numberDraws", methods=["GET"])
def get_data_8():
    lotto_name = int(request.args.get("lotto_name", 1))
    number_range = get_lotto_number_range(lotto_name)
    page_size = int(request.args.get("page_size", 10))
    page_number = int(request.args.get("page_number", 1))

    # Calculate the start and end indices for the current page
    start_index = (page_number - 1) * page_size
    return retrieve_data(lotto_name, page_size, number_range, start_index)




def get_lotto_number_range(lotto_name):
    if lotto_name == 1 or lotto_name == 2:
        return 49
    elif lotto_name == 3:
        return 50

    else:
        return 7  # for DailyGrand_GrandNumber


def retrieve_data(lotto_name, page_size, number_range, start_index):
    data = (
        Numbers.query.join(LottoType)
        .filter(LottoType.LottoName == lotto_name)
        .options(joinedload(Numbers.lottotype))
        .order_by(desc(LottoType.DrawNumber))
        .limit(page_size * number_range)
        .offset(start_index)
        .all()
    )
    numbers_dict = {}
    drawNumber_dict = {}
    drawDate_dict = {}
    result_list = []

    if data:
        for number in data:
            if number.lottotype.DrawNumber not in numbers_dict:
                numbers_dict[number.lottotype.DrawNumber] = []
            numbers_dict[number.lottotype.DrawNumber].append(
                {
                    "Value": number.Value,
                    "Distance": number.Distance,
                    "IsHit": number.IsHit,
                    "NumberOfDrawsWhenHit": number.NumberOfDrawsWhenHit,  # The line ` "IsBonusNumber":
                    "IsBonusNumber": number.IsBonusNumber,
                    "TotalHits": number.TotalHits,
                }
            )
            if len(numbers_dict[number.lottotype.DrawNumber]) == number_range:
                """print(f"i = {i}, value = {number.lottotype.DrawNumber}")"""
                if number.lottotype.DrawNumber not in drawNumber_dict:
                    drawNumber_dict[number.lottotype.DrawNumber] = []
                drawNumber_dict[
                    number.lottotype.DrawNumber
                ] = number.lottotype.DrawNumber

                if number.lottotype.DrawNumber not in drawDate_dict:
                    drawDate_dict[number.lottotype.DrawNumber] = []
                drawDate_dict[number.lottotype.DrawNumber] = number.lottotype.DrawDate

        for key in drawNumber_dict:
            value = drawNumber_dict.get(key)
            if value is None:
                break
            result_list.append(
                {
                    "DrawNumber": drawNumber_dict[key],
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
        # print(sorted_result_list)
        return jsonify({"data": sorted_result_list})
    else:
        return jsonify({"message": "No data found"})


if __name__ == "__main__":
    app.run(debug=True)
