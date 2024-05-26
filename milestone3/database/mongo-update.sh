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


db.heatmap_bikes.updateMany(
  {},
  [
    {
      \$set: {
        date: { \$toDate: "\$starttime" }
      },
    },
    {
      \$addFields: {
        week: { \$dateTrunc: { date: "\$date", unit: "week" } }
      }
    }

  ]
);

db.heatmap_taxis.updateMany(
  {},
  [
    {
      \$set: {
        date: { \$toDate: "\$starttime" }
      }
    },
    {
      \$addFields: {
        week: { \$dateTrunc: { date: "\$date", unit: "week" } }
      }
    }
  ]
);

db.heatmap_accidents.updateMany(
  {},
  [
    {
      \$set: {
        date: { \$toDate: "\$starttime" }
      },
    }
  ]
);


db.heatmap_bikes.createIndex({ "week": 1, "latitude": 1, "longitude": 1 });
db.heatmap_taxis.createIndex({ "week": 1, "latitude": 1, "longitude": 1 });


EOF

