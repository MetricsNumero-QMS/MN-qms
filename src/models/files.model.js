var dbConn = require('./../../config/db.config');
//Employee object create
var Files = function(file){
  this.doc_name       = file.docname; 
  this.doc            = file.doc_file;
  this.created_at     = new Date();
  this.created_by     = 'kiran',
  this.last_modified  = new Date();
  this.last_accessed	= new Date();
  this.version        = '1';
  this.status         = '0';
};
//Query to list the document in category page.
Files.selectAllFiles = function (request,filePath, result) {     
  var query = "select REPLACE(REPLACE(REPLACE(doc, '.docx', '.pdf') , '.pptx', '.pdf') , '.xlsx', '.pdf') as doc,doc  as docDn,  doc_num,doc_path,doc as doc_name,version,docRelVer,docDesc,releaseDt from file_info where status = 0 and doc_path = '"+filePath+"';select replace(SUBSTRING_INDEX(doc_name,'.',1),'_',' ') as doc_name,doc_num from file_info where doc_path='"+filePath+"' ORDER BY doc_num DESC LIMIT 1";
  //var query = "select REPLACE(REPLACE(REPLACE(doc, '.docx', '.pdf') , '.pptx', '.pdf') , '.xlsx', '.pdf') as doc,doc  as docDn,  doc_num,doc_path,replace(SUBSTRING_INDEX(doc,'.',1),'_',' ') as doc_name,version,docRelVer,docDesc,releaseDt from file_info where status = 0 and doc_path = '"+filePath+"';select replace(SUBSTRING_INDEX(doc_name,'.',1),'_',' ') as doc_name,doc_num from file_info where doc_path='"+filePath+"' ORDER BY doc_num DESC LIMIT 1";
    dbConn.query(query,[1,2], function (err, res) {
  if(err) {
    console.log("error: ", err);
    return result(err,null);
  }else{
    return result(null,res);
  }
  });
};  
Files.uploadDoc = function (docDet, result) {
    dbConn.query("INSERT INTO file_info set ?", docDet, function (err, res) {
    if(err) {
      console.log("error: ", err);
      result(err, null);
    }
    else{      
      result(null, res.insertId);
    }
  });
};
// query to fetch file data by doc id and diplay in edit modal.  
Files.getDataById = function (id, result) {       
    dbConn.query("select * from file_info where doc_num = ?", [id], function (err, res) {
    if(err) {
      console.log("error: ", err);
      return result(err,null);
    }else{            
      return result(null,res);
    }
  });
};  
//query to check valid user name and password in login page. 
Files.loginChk = function (email,password, result) {              
  var query = "select * from login where emp_email = '"+email+"' and pswd = '"+password+"';select user_role from login where emp_email = '"+email+"' and pswd = '"+password+"'";  
  dbConn.query(query, [1,2], function (err, res) {
  if(err) {
    console.log("error: ", err);
    return result(err,null);
  }else{           
    return result(null,res);
  }
  });
}; 
//query to get detail of document by doc name and file access type, to update log in same table.    
Files.getDataByDoc = function (viewed_doc,file_access_type, result) {        
  dbConn.query("select * from doc_log_info where doc_name = ? and doc_accessed_type = ?", [viewed_doc,file_access_type], function (err, res) {
  if(err) {
    console.log("error: ", err);
    return result(err,null);
  }else{         
    return result(null,res);
  }
  });
};  
//Query to fetch document log detail to diplay in home page notification.
Files.docLogDet = function (result) {          
  var query = "SELECT replace(SUBSTRING_INDEX(doc_name,'.',1),'_',' ') as doc_name FROM (SELECT T1.*, @rownum := @rownum + 1 AS rn FROM doc_log_info T1, (SELECT @rownum := 0) T2 ) T3 where doc_accessed_type = 0 ORDER BY accessed_datetime DESC LIMIT 3;SELECT replace(SUBSTRING_INDEX(doc_name,'.',1),'_',' ') as doc_name FROM ( SELECT T1.*, @rownum := @rownum + 1 AS rn FROM doc_log_info T1, (SELECT @rownum := 0) T2 ) T3 where doc_accessed_type = 1 ORDER BY accessed_datetime DESC LIMIT 3;SELECT count(*) as ttlcount FROM `file_info` where status = 0;select doc_path,replace(SUBSTRING_INDEX(file_info.doc_name,'.',1),'_',' ') as doc_name from notification left join file_info on file_info.doc_num=notification.doc_id order by notification.notify_id desc limit 1";            
  dbConn.query(query,[1,2,3,4] ,function (err, res, fields) {
  if(err) {           
    return result(err,null);
  }else{                   
    return result(null,res);
  }                  
  });        
}; 
//Query to retrieve user data to display in view user profile page.
Files.userDetById = function (username, result) {
  dbConn.query(
    "SELECT user_id, first_name, last_name, username, emp_email, user_role, department, reporting_manager, sys_role FROM login WHERE emp_email = ? OR username = ? LIMIT 1",
    [username, username],
    function (err, res) {
      if (err) return result(err, null);
      return result(null, res);
    }
  );
};               
module.exports = Files;