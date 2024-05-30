mongo <<EOF
db = db.getSiblingDB('project');

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

