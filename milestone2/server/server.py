from flask import Flask, jsonify
import pymongo
import os
from pymongo import MongoClient

def get_db():
    client = MongoClient(host=os.environ['MONGODB_HOSTNAME'],
                         port=27017, 
                         username=os.environ['MONGODB_USERNAME'], 
                         password=os.environ['MONGODB_PASSWORD'],
                        authSource="admin")
    return client[os.environ['MONGODB_DATABASE']]

app = Flask(__name__)
db = get_db()

@app.route('/')
def ping_server():
    return "Welcome to Data Viz."


if __name__=='__main__':
    app.run(host="0.0.0.0", port=5000)
