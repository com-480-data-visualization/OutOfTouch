import os
import pymongo

from datetime import datetime
from pymongo import MongoClient
from flask import Flask, jsonify, render_template, make_response

def get_db():
    client = MongoClient(host=os.environ['MONGODB_HOSTNAME'],
                         port=27017, 
                         username=os.environ['MONGODB_USERNAME'], 
                         password=os.environ['MONGODB_PASSWORD'],
                        authSource="admin")
    return client[os.environ['MONGODB_DATABASE']]

app = Flask(__name__)
db = get_db()

def timeseries_retrieval(collection_name, field_date, start_date=datetime(2018,12,31), end_date=datetime(2023,1,1), region=None):
    date_id = '$' + field_date
    pipeline = [
            {
                '$match': {
                    field_date : {'$gte': start_date, '$lte': end_date}
                }
            },
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
        ]

    if region is not None:
        pipeline.insert(0, {
                '$match': {
                    'region': region
                }
            })
        


    return list(db[collection_name].aggregate(pipeline))

@app.route('/')
def home_page():
    return "Welcome to Data Viz Server."

@app.route('/api/accidents', methods=['GET'])
def retrieve_accidents():
    try:
        # Query accidents collection
        accidents = timeseries_retrieval(collection_name='accidents', field_date='accident_date')
        
        # Return formatted data as JSON response with success status
        return jsonify({'success': True, 'accidents': accidents}), 200
    
    except Exception as e:
        # Return error message with appropriate HTTP status code
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/accidents/zone/<zone_id>', methods=['GET'])
def get_accidents_by_zone(zone_id):
    try:
        # Query accidents collection
        accidents = timeseries_retrieval(collection_name='accidents', field_date='accident_date', region=zone_id)
        
        # Return formatted data as JSON response with success status
        return jsonify({'success': True, 'accidents': accidents}), 200
    
    except Exception as e:
        # Return error message with appropriate HTTP status code
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/bikes', methods=['GET'])
def retrieve_bikes():
    return make_response("OK", 200)

@app.route('/api/bikes/zone/<zone_id>', methods=['GET'])
def get_bikes_by_zones(zone_id):
    return make_response("OK", 200)

@app.route('/api/cars', methods=['GET'])
def retrieve_cars():
    return make_response("OK", 200)

@app.route('/api/cars/zone/<zone_id>', methods=['GET'])
def get_cars_by_zones(zone_id):
    return make_response("OK", 200)

if __name__=='__main__':
    app.run(host="0.0.0.0", port=5000)
