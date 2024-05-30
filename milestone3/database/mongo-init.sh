set -e

mongo <<EOF
db = db.getSiblingDB('project')

db.adminCommand(
   {
     enableSharding: "project"
   }
);

db.createCollection("race_taxi", {
   validator: {
      \$jsonSchema: {
         bsonType: "object",
         required: ["date", "name", "value"],
         properties: {
            date: {
               bsonType: "string",
               pattern: "^[0-9]{4}-([0-9]{2}$",
               description: ""
            },
            name: {
               bsonType: "string",
               description: ""
            },
            value: {
               bsonType: "double",
               description: ""
            },
         }
      }
   }
});

db.createCollection("race_bikes", {
   validator: {
      \$jsonSchema: {
         bsonType: "object",
         required: ["date", "name", "value"],
         properties: {
            date: {
               bsonType: "string",
               pattern: "^[0-9]{4}-([0-9]{2}$",
               description: ""
            },
            name: {
               bsonType: "string",
               description: ""
            },
            value: {
               bsonType: "double",
               description: ""
            },
         }
      }
   }
});

db.createCollection("race_crashes", {
   validator: {
      \$jsonSchema: {
         bsonType: "object",
         required: ["date", "name", "value"],
         properties: {
            date: {
               bsonType: "string",
               pattern: "^[0-9]{4}-([0-9]{2}$",
               description: ""
            },
            name: {
               bsonType: "string",
               description: ""
            },
            value: {
               bsonType: "double",
               description: ""
            },
         }
      }
   }
});

db.createCollection("timeseries_taxis", {
   validator: {
      \$jsonSchema: {
         bsonType: "object",
         required: ["date", "count"],
         properties: {
            starttime: {
               bsonType: "string",
               pattern: "^[0-9]{4}-([0-9]{2}$",
               description: ""
            },
            pickup_count: {
               bsonType: "double",
               description: ""
            },
         }
      }
   }
});


db.createCollection("timeseries_bikes", {
   validator: {
      \$jsonSchema: {
         bsonType: "object",
         required: ["date", "count"],
         properties: {
            starttime: {
               bsonType: "string",
               pattern: "^[0-9]{4}-([0-9]{2}$",
               description: ""
            },
            bike_count: {
               bsonType: "double",
               description: ""
            },
         }
      }
   }
});


db.createCollection("timeseries_accidents", {
   validator: {
      \$jsonSchema: {
         bsonType: "object",
         required: ["date", "count"],
         properties: {
            starttime: {
               bsonType: "string",
               pattern: "^[0-9]{4}-([0-9]{2}$",
               description: ""
            },
            crash_count: {
               bsonType: "double",
               description: ""
            },
         }
      }
   }
});


db.createCollection("heatmap_bikes", {
   validator: {
      \$jsonSchema: {
         bsonType: "object",
         required: ["date", "name", "value"],
         properties: {
            starttime: {
               bsonType: "string",
               pattern: "^[0-9]{4}-([0-9]{2}$",
               description: ""
            },
            latitude: {
               bsonType: "double",
               description: ""
            },
            longitude: {
               bsonType: "double",
               description: ""
            },
            count: {
               bsonType: "double",
               description: ""
            },
         }
      }
   }
});

db.createCollection("heatmap_taxis", {
   validator: {
      \$jsonSchema: {
         bsonType: "object",
         required: ["date", "name", "value"],
         properties: {
            starttime: {
               bsonType: "string",
               pattern: "^[0-9]{4}-([0-9]{2}$",
               description: ""
            },
            latitude: {
               bsonType: "double",
               description: ""
            },
            longitude: {
               bsonType: "double",
               description: ""
            },
            count: {
               bsonType: "double",
               description: ""
            },
         }
      }
   }
});

db.createCollection("heatmap_accidents", {
   validator: {
      \$jsonSchema: {
         bsonType: "object",
         required: ["date", "name", "value"],
         properties: {
            starttime: {
               bsonType: "string",
               pattern: "^[0-9]{4}-([0-9]{2}$",
               description: ""
            },
            latitude: {
               bsonType: "double",
               description: ""
            },
            longitude: {
               bsonType: "double",
               description: ""
            },
            count: {
               bsonType: "double",
               description: ""
            },
         }
      }
   }
});


db.createCollection("pre_pandemic_matrix_bike")
db.createCollection("pre_pandemic_zones_bike")
db.createCollection("pandemic_matrix_bike")
db.createCollection("pandemic_zones_bike")
db.createCollection("post_pandemic_matrix_bike")
db.createCollection("post_pandemic_zones_bike")

db.createCollection("pre_pandemic_matrix_taxi")
db.createCollection("pre_pandemic_zones_taxi")
db.createCollection("pandemic_matrix_taxi")
db.createCollection("pandemic_zones_taxi")
db.createCollection("post_pandemic_matrix_taxi")
db.createCollection("post_pandemic_zones_taxi")

db.createCollection("spiral_bikes")
db.createCollection("spiral_taxis")
db.createCollection("spiral_accidents")


EOF

mongoimport --db project --collection race_taxi --type csv --headerline --file /docker-entrypoint-initdb.d/race_taxi.csv
mongoimport --db project --collection race_bikes --type csv --headerline --file /docker-entrypoint-initdb.d/race_bikes.csv
mongoimport --db project --collection race_crashes --type csv --headerline --file /docker-entrypoint-initdb.d/race_crashes.csv

mongoimport --db project --collection timeseries_taxis --type csv --headerline --file /docker-entrypoint-initdb.d/taxi_timeseries.csv
mongoimport --db project --collection timeseries_bikes --type csv --headerline --file /docker-entrypoint-initdb.d/bike_timeseries.csv
mongoimport --db project --collection timeseries_accidents --type csv --headerline --file /docker-entrypoint-initdb.d/crashes_timeseries.csv

mongoimport --db project --collection heatmap_taxis --type csv --headerline --file /docker-entrypoint-initdb.d/taxi_heatmap.csv
mongoimport --db project --collection heatmap_bikes --type csv --headerline --file /docker-entrypoint-initdb.d/bike_heatmap.csv
mongoimport --db project --collection heatmap_accidents --type csv --headerline --file /docker-entrypoint-initdb.d/crashes_heatmap.csv

mongoimport --db project --collection pre_pandemic_matrix_bike --file /docker-entrypoint-initdb.d/pre_pandemic_matrix.json --type json
mongoimport --db project --collection pandemic_matrix_bike --file /docker-entrypoint-initdb.d/pandemic_matrix.json  --type json
mongoimport --db project --collection post_pandemic_matrix_bike --file /docker-entrypoint-initdb.d/post_pandemic_matrix.json  --type json

mongoimport --db project --collection pre_pandemic_zones_bike --file /docker-entrypoint-initdb.d/pre_pandemic_zones.json --type json
mongoimport --db project --collection pandemic_zones_bike --file /docker-entrypoint-initdb.d/pandemic_zones.json --type json
mongoimport --db project --collection post_pandemic_zones_bike --file /docker-entrypoint-initdb.d/post_pandemic_zones.json --type json

mongoimport --db project --collection spiral_bikes --type csv --headerline --file /docker-entrypoint-initdb.d/bike_spiral.csv
mongoimport --db project --collection spiral_taxis --type csv --headerline --file /docker-entrypoint-initdb.d/taxi_spiral.csv
mongoimport --db project --collection spiral_accidents --type csv --headerline --file /docker-entrypoint-initdb.d/crashes_spiral.csv

mongoimport --db project --collection pre_pandemic_matrix_taxi --file /docker-entrypoint-initdb.d/pre_pandemic_matrix_taxi.json --type json
mongoimport --db project --collection pandemic_matrix_taxi --file /docker-entrypoint-initdb.d/pandemic_matrix_taxi.json  --type json
mongoimport --db project --collection post_pandemic_matrix_taxi --file /docker-entrypoint-initdb.d/post_pandemic_matrix_taxi.json  --type json

mongoimport --db project --collection pre_pandemic_zones_taxi --file /docker-entrypoint-initdb.d/pre_pandemic_zones_taxi.json --type json
mongoimport --db project --collection pandemic_zones_taxi --file /docker-entrypoint-initdb.d/pandemic_zones_taxi.json --type json
mongoimport --db project --collection post_pandemic_zones_taxi --file /docker-entrypoint-initdb.d/post_pandemic_zones_taxi.json --type json
