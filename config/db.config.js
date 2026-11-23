const mysql = require('mysql');
//local mysql db connection
const dbConn = mysql.createConnection({
  port     : '3306',
  host     : 'localhost',
  user     : 'root',
  password : 'MNsql2025!',
  database : 'alpha_qms_db',
  multipleStatements: true
});

dbConn.connect(function(err) {
  if(err) throw err;
  console.log("Database Connected!");
});
module.exports = dbConn;
