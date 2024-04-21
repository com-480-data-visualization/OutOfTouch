set -e

mongo <<EOF
db = db.getSiblingDB('project')

db.adminCommand(
   {
     enableSharding: "project"
   }
);

// Create the collection for accidents with schema validation
db.createCollection("accidents", {
   validator: {
      \$jsonSchema: {
         bsonType: "object",
         required: ["crash_time", "latitude", "longitude", "borough", "region"],
         properties: {
            crash_date: {
               bsonType: "string",
               pattern: "^(2019|202[0-3])-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$",
               description: "Crash Date must be a string with format YYYY-MM-DD and is required"
            },
            crash_time: {
               bsonType: "string",
               pattern: "^([0-1][0-9]|2[0-4]|[0-9]):([0-5][0-9])$",
               description: "Crash Time must be a string with format HH:MM and is required"
            },
            latitude: {
               bsonType: "double",
               description: "Latitude must be a double and is required"
            },
            longitude: {
               bsonType: "double",
               description: "Longitude must be a double and is required"
            },
            borough: {
               bsonType: "string",
               description: "Borough must be a string and is required"
            },
            region: {
               bsonType: "string",
               description: "Region must be a string and is required"
            }
         }
      }
   }
});

db.createCollection("taxis", {
   validator: {
      \$jsonSchema: {
         bsonType: "object",
         required: ["trip_distance", "fare_amount", "tip_amount", "total_amount", "source_zone", "destination_zone", "latitude_source", "longitude_source", "latitude_destination", "longitude_destination"],
         properties: {
            lpep_pickup_datetime: {
               bsonType: "string",
               pattern: "^[0-9]{4}-([0-9]{2}|[0-9])-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$",
               description: ""
            },
            lpep_dropoff_datetime: {
               bsonType: "string",
               pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$",
               description: ""
            },
            trip_distance: {
               bsonType: "double",
               description: ""
            },
            fare_amount: {
               bsonType: "double",
               description: ""
            },
            tip_amount: {
               bsonType: "double",
               description: ""
            },
            total_amount: {
               bsonType: "double",
               description: ""
            },
            source_zone: {
               bsonType: "string",
               description: ""
            },
            destination_zone: {
               bsonType: "string",
               description: ""
            },
            latitude_source: {
               bsonType: "double",
               description: ""
            },
            longitude_source: {
               bsonType: "double",
               description: ""
            },
            latitude_destination: {
               bsonType: "double",
               description: ""
            },
            longitude_destination: {
               bsonType: "double",
               description: ""
            }
         }
      }
   }
});


db.createCollection("bikes", {
   validator: {
      \$jsonSchema: {
         bsonType: "object",
         required: ["starttime", "stoptime", "start_lat", "start_lng", "end_lat", "end_lng", "start_zone", "end_zone", "distance"],
         properties: {
            start_lat: {
               bsonType: "double",
               description: ""
            },
            start_lng: {
               bsonType: "double",
               description: ""
            },
            end_lat: {
               bsonType: "double",
               description: ""
            },
            end_lng: {
               bsonType: "double",
               description: ""
            },
            start_zone: {
               bsonType: "string",
               description: ""
            },
            end_zone: {
               bsonType: "string",
               description: ""
            },
            distance: {
               bsonType: "double",
               description: ""
            }
         }
      }
   }
});


EOF

mongoimport --db project --collection accidents --type csv --headerline --file /docker-entrypoint-initdb.d/crashes.csv
mongoimport --db project --collection taxis --type csv --headerline --file /docker-entrypoint-initdb.d/taxi_dataset.csv
mongoimport --db project --collection bikes --type csv --headerline --file /docker-entrypoint-initdb.d/bike_dataset.csv