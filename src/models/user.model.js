'use strict';
var dbConn = require('./../../config/db.config');
//Employee object create
var Users = function(user){
  this.name           = user.name;
  this.email          = user.email;
  this.password       = user.password;  
  this.created_at     = new Date();
  this.updated_at     = new Date();
};
Users.create = function (newEmp, result) {
dbConn.query("INSERT INTO users set ?", newEmp, function (err, res) {
if(err) {
  console.log("error: ", err);
  result(err, null);
}
else{
  console.log(res.insertId);
  result(null, res.insertId);
}
});
};

Users.findByUser = function (request, result) {
  let email = request.email;
	let password = request.password;
  dbConn.query("Select * from users where email = ? and password = ? ", [email,password], function (err, res) {
  if(err) {
    console.log("error: ", err);
    result(err, null);
  }
  else{
    console.log(res.length);
    result(null, res);
  }
  });
  };
module.exports= Users;