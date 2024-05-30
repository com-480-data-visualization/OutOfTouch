import json
import os
import pymongo
import joblib
import numpy as np
import pandas as pd

from flask_cors import CORS
from datetime import datetime
from pymongo import MongoClient
from flask import Flask, jsonify, render_template, make_response, request
# from sklearn.linear_model import LogisticRegression

def get_db():
    client = MongoClient(host=os.environ['MONGODB_HOSTNAME'],
                         port=27017, 
                         username=os.environ['MONGODB_USERNAME'], 
                         password=os.environ['MONGODB_PASSWORD'],
                        authSource="admin")
    return client[os.environ['MONGODB_DATABASE']]

app = Flask(__name__)
CORS(app, supports_credentials=True)
db = get_db()

model = joblib.load('model_simple.pkl')


def retrieve_all_timeseries(collection_name):
    return list(db[collection_name].find({}, {"_id": 0}))


def timeseries_retrieval(collection_name, field_date, start_date=datetime(2018,12,31), end_date=datetime(2023,1,1), region_name="", region=None):
    date_id = '$' + field_date
    pipeline = []
    if start_date is not None and end_date is not None:
        pipeline.append({
            '$match': {
                field_date: {'$gte': start_date, '$lte': end_date}
            }
        })

    pipeline.extend([
        {
            '$group': {
                '_id': {
                    'year': {'$year': date_id},
                    'month': {'$month': date_id},
                    'day': {'$dayOfMonth': date_id}
                },
                'count': {'$sum': 1}
            }
        },
        {
            '$sort': {'_id.year': 1, '_id.month': 1, '_id.day': 1}
        }
    ])

    if region is not None:
        pipeline.insert(0, {
                '$match': {
                    region_name: region
                }
            })

    return list(db[collection_name].aggregate(pipeline))


def heatmap_retrieval(collection_name, field_date, latitude_name, longitude_name, start_date=None, end_date=None, weekly=False):
    pipeline = []

    # Match stage
    match_stage = {}
    if start_date is not None and end_date is not None:
        match_stage[field_date] = {"$gte": start_date, "$lte": end_date}
        pipeline.append({"$match": match_stage})

    if not weekly:
        # Project stage
        pipeline.append({
            "$project": {
                "_id": 0
            }
        })

        result = list(db[collection_name].find({}, {'_id': 0, f"{field_date}": 1, f"{latitude_name}": 1, f"{longitude_name}": 1, f"count": 1}))
        return result

    # Group stage to group by week, latitude, and longitude
    group_stage = {
        "$group": {
            "_id": {
                "week": "$week",
                latitude_name: f"${latitude_name}",
                longitude_name: f"${longitude_name}"
            },
            "count": {"$sum": "$count"}
        }
    }
    pipeline.append(group_stage)

    # Final project stage to format the output
    final_project_stage = {
        "$project": {
            "_id": 0,
            field_date: "$_id.week",
            latitude_name: f"$_id.{latitude_name}",
            longitude_name: f"$_id.{longitude_name}",
            "count": 1
        }
    }
    pipeline.append(final_project_stage)

    # Execute the aggregation pipeline
    result = list(db[collection_name].aggregate(pipeline))

    return result

def get_entire_collection(collection_name):
    data = list(db[f"{collection_name}"].find({}, {'_id': 0}))
    return data

def race(collection_name):
    return list(db[collection_name].find())

def time_to_float(time_str):
    try:
        hours, minutes = map(int, time_str.split(':'))
        print(hours, minutes)
        print(hours + minutes / 60.0)
        return hours + minutes / 60.0
    except ValueError as e:
        raise ValueError(f"Invalid time format: {time_str}. Expected format 'HH:MM'.") from e


@app.route('/')
def home_page():
    return "Welcome to Data Viz Server."

@app.route('/api/accidents', methods=['GET'])
def retrieve_accidents():
    try:
        # Query accidents collection
        accidents = retrieve_all_timeseries(collection_name='timeseries_accidents')

        # Return formatted data as JSON response with success status
        return jsonify({'success': True, 'accidents': accidents}), 200
    
    except Exception as e:
        # Return error message with appropriate HTTP status code
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/accidents/coordinates', methods=['GET'])
def retrieve_accident_coordinates():
    start_date_str = request.args.get("start_date")
    end_date_str = request.args.get("end_date")

    if start_date_str is None or end_date_str is None:
        return jsonify({"error": "Both start_date and end_date are required."}), 400

    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format. Please use YYYY-MM-DD."}), 400

    result = heatmap_retrieval('heatmap_accidents', 'date', 'latitude', 'longitude')

    return jsonify(result), 200

@app.route('/api/accidents/race', methods=['GET'])
def get_top_zones_accidents():
    try:
        # Query accidents collection
        crashes = get_entire_collection(collection_name='race_crashes')

        # Return formatted data as JSON response with success status
        return json.dumps(crashes, default=str), 200

    except Exception as e:
        # Return error message with appropriate HTTP status code
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/bikes', methods=['GET'])
def retrieve_bikes():
    try:
        # Query accidents collection
        bikes = retrieve_all_timeseries(collection_name='timeseries_bikes')

        # Return formatted data as JSON response with success status
        return jsonify({'success': True, 'bikes': bikes}), 200
    
    except Exception as e:
        # Return error message with appropriate HTTP status code
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/bikes/race', methods=['GET'])
def get_top_zones_bikes():
    try:
        # Query accidents collection
        bikes = get_entire_collection(collection_name='race_bikes')

        # Return formatted data as JSON response with success status
        return json.dumps(bikes, default=str), 200

    except Exception as e:
        # Return error message with appropriate HTTP status code
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/bikes/coordinates', methods=['GET'])
def retrieve_bike_coordinates():
    start_date_str = request.args.get("start_date")
    end_date_str = request.args.get("end_date")

    if start_date_str is None or end_date_str is None:
        return jsonify({"error": "Both start_date and end_date are required."}), 400

    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format. Please use YYYY-MM-DD."}), 400

    result = heatmap_retrieval('heatmap_bikes', 'date', 'latitude', 'longitude', weekly=True)

    return jsonify(result), 200

@app.route('/api/taxis', methods=['GET'])
def retrieve_taxis():
    try:
        # Query accidents collection
        taxis = retrieve_all_timeseries(collection_name='timeseries_taxis')
        # Return formatted data as JSON response with success status
        return jsonify({'success': True, 'taxis': taxis}), 200
    
    except Exception as e:
        # Return error message with appropriate HTTP status code
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/taxis/race', methods=['GET'])
def get_top_zones_taxis():
    try:
        # Query accidents collection
        taxis = get_entire_collection(collection_name='race_taxi')
        
        # Return formatted data as JSON response with success status
        return json.dumps(taxis, default=str), 200
    
    except Exception as e:
        # Return error message with appropriate HTTP status code
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/taxis/coordinates', methods=['GET'])
def retrieve_taxi_coordinates():
    start_date_str = request.args.get("start_date")
    end_date_str = request.args.get("end_date")

    if start_date_str is None or end_date_str is None:
        return jsonify({"error": "Both start_date and end_date are required."}), 400

    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format. Please use YYYY-MM-DD."}), 400

    result = heatmap_retrieval('heatmap_taxis', 'date', 'latitude', 'longitude', weekly=True)

    return jsonify(result), 200

@app.route('/api/taxis/zone/<zone_id>', methods=['GET'])
def get_taxis_by_zones(zone_id):
    try:
        # Query accidents collection
        taxis = timeseries_retrieval(collection_name='taxis', field_date='starttime', region_name='source_zone', region=zone_id)

        # Return formatted data as JSON response with success status
        return jsonify({'success': True, 'taxis': taxis}), 200
    
    except Exception as e:
        # Return error message with appropriate HTTP status code
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/routes/<resource>', methods=['GET'])
def get_top_routes(resource):
    try:
        # Retrieve data from the 'matrix' collection
        pre_pandemic_data = list(db[f"pre_pandemic_matrix_{resource}"].find({}, {'_id': 0}))[0]['data']
        pandemic_data = list(db[f"pandemic_matrix_{resource}"].find({}, {'_id': 0}))[0]['data']
        post_pandemic_data = list(db[f"post_pandemic_matrix_{resource}"].find({}, {'_id': 0}))[0]['data']

        # Retrieve data from the 'zones' collection
        pre_pandemic_zones_data = list(db[f"pre_pandemic_zones_{resource}"].find({}, {'_id': 0}))[0]['data']
        pandemic_zones_data = list(db[f"pandemic_zones_{resource}"].find({}, {'_id': 0}))[0]['data']
        post_pandemic_zones_data = list(db[f"post_pandemic_zones_{resource}"].find({}, {'_id': 0}))[0]['data']


        return jsonify({
            'pre_pandemic_matrix': pre_pandemic_data,
            'pandemic_matrix': pandemic_data,
            'post_pandemic_matrix': post_pandemic_data,
            'pre_pandemic_zones': pre_pandemic_zones_data,
            'pandemic_zones': pandemic_zones_data,
            'post_pandemic_zones': post_pandemic_zones_data
        }), 200
    except Exception as e:
        print(str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/timeseries/<resource>', methods=['GET'])
def get_timeseries_data(resource):
    try:
        # Query accidents collection
        data = get_entire_collection(collection_name=f"spiral_{resource}")

        # Return formatted data as JSON response with success status
        return jsonify({'data': data}), 200
    
    except Exception as e:
        # Return error message with appropriate HTTP status code
        return jsonify({'error': str(e)}), 500


@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)
        latitude = data['latitude']
        longitude = data['longitude']
        time_float = time_to_float(data['time'])
        print(latitude)
        print(longitude)

        # np_data =  np.array([[latitude, longitude, time_float]])
        np_data = pd.DataFrame({'longitude': [longitude], 'latitude': [latitude], 'crash_time': [time_float]})
        # Make predictions
        prediction = model.predict_proba(np_data)[:, 1]* 100
        color = 'red'
        if prediction <=30:
            color = 'green'
        elif prediction > 30 and prediction <=70:
            color = 'orange'
        print(prediction)
        print("--------------------")
        # Return predictions as JSON
        return jsonify(color)
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__=='__main__':
    app.run(host="0.0.0.0", port=5000)

