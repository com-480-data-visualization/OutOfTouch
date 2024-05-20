mongo <<EOF
db = db.getSiblingDB('project');
db.accidents.updateMany(
  {},
  [
    {
      \$set: {
        accident_date: {
          \$dateToString: { format: "%Y-%m-%d", date: { \$toDate: "\$crash_date" } }
        }
      }
    }
  ]
);

db.taxis.updateMany(
  {},
  [
    {
      \$set: {
        starttime: {
          \$dateToString: { format: "%Y-%m-%d", date: { \$toDate: "\$lpep_pickup_datetime" } }
        },
        stoptime: {
          \$dateToString: { format: "%Y-%m-%d", date: { \$toDate: "\$lpep_dropoff_datetime" } }
        }
      },
    }
  ]
);

db.bikes.updateMany(
  {},
  [
    {
      \$set: {
        starttime: {
          \$dateToString: { format: "%Y-%m-%d", date: { \$toDate: "\$starttime" } }
        },
        stoptime: {
          \$dateToString: { format: "%Y-%m-%d", date: { \$toDate: "\$stoptime" } }
        }
      },
    }
  ]
);

db.taxis.updateMany(
   {},
   { \$unset: {
     { lpep_pickup_datetime: "" },
     { lpep_dropoff_datetime: ""} 
   }
)


db.accidents.updateMany(
   {},
   { \$unset: { crash_date: "" } }
)

db.taxis.createIndex(
    {
        starttime: 1,
        latitude_source: 1,
        longitude_source: 1
    }
);

db.bikes.createIndex(
    {
        starttime: 1,
        start_lat: 1,
        start_lng: 1
    }
);

EOF
