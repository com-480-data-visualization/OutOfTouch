set -e

mongo <<EOF
db = db.getSiblingDB('project')

// Create the collection for accidents with schema validation
db.createCollection("accidents", {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: ["crash_date", "crash_time", "location", "latitude", "longitude", "borough"],
         properties: {
            crash_date: {
               bsonType: "string",
               pattern: "^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/(19|20)\\d{2}$",
               description: "Crash Date must be a string with format MM/DD/YYYY and is required"
            },
            crash_time: {
               bsonType: "string",
               pattern: "^([01][0-9]|2[0-3]):([0-5][0-9])$",
               description: "Crash Time must be a string with format HH:MM and is required"
            },
            location: {
               bsonType: "string",
               description: "Location must be a string and is required"
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
            }
         }
      }
   }
});


EOF