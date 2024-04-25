import os
import pymongo

from flask_cors import CORS
from datetime import datetime
from pymongo import MongoClient
from flask import Flask, jsonify, render_template, make_response, request

def get_db():
    client = MongoClient(host=os.environ['MONGODB_HOSTNAME'],
                         port=27017, 
                         username=os.environ['MONGODB_USERNAME'], 
                         password=os.environ['MONGODB_PASSWORD'],
                        authSource="admin")
    return client[os.environ['MONGODB_DATABASE']]

app = Flask(__name__)
CORS(app)
db = get_db()

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


def heatmap_retrieval(collection_name, field_date, latitude_name, longitude_name, start_date=None, end_date=None):
    query = {}
    if start_date is not None and end_date is not None:
        query["field_date"] = {"$gte": start_date, "$lte": end_date}

    pipeline = [
        {"$match": query},  # Filter documents based on query
        {"$group": {
            "_id": {
                "date": {"$dateToString": {"format": "%Y-%m-%d", "date": f"${field_date}"}},
                "latitude": f"${latitude_name}",
                "longitude": f"${longitude_name}"
            },
            "count": {"$sum": 1}  # Count number of documents for each group
        }},
        {"$project": {
            "_id": 0,
            "date": "$_id.date",
            "lat": "$_id.latitude",
            "long": "$_id.longitude",
            "count": "$count"
        }}
    ]

    result = db[collection_name].aggregate(pipeline, allowDiskUse=True)
    return list(result)

def top_zones(collection_name, field_date, field_zone):
    pipeline = [
        # Extract month and year from the timestamp field
        {
            "$addFields": {
                "month": {"$month": f"${field_date}"},
                "year": {"$year": f"${field_date}"}
            }
        },
        # Group documents by month, year, and zone
        {
            "$group": {
                "_id": {"month": "$month", "year": "$year", "zone": f"${field_zone}"},
                "total": {"$sum": 1}  # Aggregate any relevant metric
            }
        },
        # Sort by month, year, and total in descending order
        {
            "$sort": {
                "_id.year": -1,
                "_id.month": -1,
                "total": -1
            }
        },
        # Group again by month and year, and push top 10 zones into an array
        {
            "$group": {
                "_id": {"month": "$_id.month", "year": "$_id.year"},
                "zones": {"$push": {"zone": "$_id.zone", "total": "$total"}}
            }
        },
        # Project to reshape the document
        {
            "$project": {
                "_id": 0,
                "month": "$_id.month",
                "year": "$_id.year",
                "top10Zones": {"$slice": ["$zones", 10]}  # Extract top 10 zones
            }
        }
    ]

    result = list(db[collection_name].aggregate(pipeline))
    return result

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


    result = heatmap_retrieval('accidents', 'accident_date', 'latitude', 'longitude')

    return jsonify(result), 200

@app.route('/api/accidents/zone/<zone_id>', methods=['GET'])
def get_accidents_by_zone(zone_id):
    try:
        # Query accidents collection
        accidents = timeseries_retrieval(collection_name='accidents', field_date='accident_date', region_name='region', region=zone_id)
        
        # Return formatted data as JSON response with success status
        return jsonify({'success': True, 'accidents': accidents}), 200
    
    except Exception as e:
        # Return error message with appropriate HTTP status code
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/bikes', methods=['GET'])
def retrieve_bikes():
    try:
        # Query accidents collection
        bikes = timeseries_retrieval(collection_name='bikes', field_date='starttime')

        # Return formatted data as JSON response with success status
        return jsonify({'success': True, 'bikes': bikes}), 200
    
    except Exception as e:
        # Return error message with appropriate HTTP status code
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/bikes/race', methods=['GET'])
def get_top_zones_bikes():
    try:
        # Query accidents collection
        bikes = top_zones(collection_name='bikes', field_date='starttime', field_zone='start_zone')
        
        # Return formatted data as JSON response with success status
        return jsonify({'success': True, 'bikes': bikes}), 200
    
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


    result = heatmap_retrieval('bikes', 'starttime', 'start_lat', 'start_lng')

    return jsonify(result), 200

@app.route('/api/bikes/zone/<zone_id>', methods=['GET'])
def get_bikes_by_zones(zone_id):
    try:
        # Query accidents collection
        bikes = timeseries_retrieval(collection_name='bikes', field_date='starttime', region_name='start_zone', region=zone_id)

        # Return formatted data as JSON response with success status
        return jsonify({'success': True, 'bikes': bikes}), 200
    
    except Exception as e:
        # Return error message with appropriate HTTP status code
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/taxis', methods=['GET'])
def retrieve_taxis():
    try:
        # Query accidents collection
        taxis = timeseries_retrieval(collection_name='taxis', field_date='starttime')
        # Return formatted data as JSON response with success status
        return jsonify({'success': True, 'taxis': taxis}), 200
    
    except Exception as e:
        # Return error message with appropriate HTTP status code
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/taxis/race', methods=['GET'])
def get_top_zones_taxis():
    try:
        # Query accidents collection
        taxis = top_zones(collection_name='taxis', field_date='starttime', field_zone='source_zone')
        
        # Return formatted data as JSON response with success status
        return jsonify({'success': True, 'taxis': taxis}), 200
    
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

    result = heatmap_retrieval('taxis', 'starttime', 'latitude_source', 'longitude_source')

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

if __name__=='__main__':
    app.run(host="0.0.0.0", port=5000)
