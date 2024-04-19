mongo <<EOF
db = db.getSiblingDB('project');
db.accidents.updateMany(
  {},
  [
    {
      \$set: {
        accident_date: {
          \$toDate: "\$crash_date"
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
          \$toDate: "\$lpep_pickup_datetime"
        },
        stoptime: {
          \$toDate: "\$lpep_dropoff_datetime"
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
          \$toDate: "\$starttime"
        },
        stoptime: {
          \$toDate: "\$stoptime"
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

EOF
