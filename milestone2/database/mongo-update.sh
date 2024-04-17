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

EOF
