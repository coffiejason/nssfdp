const express = require('express');
var cors = require('cors');
var mongo = require('mongodb'); 
var MongoClient = require('mongodb').MongoClient;
var nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

var dateObj = new Date();
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();

var current_hour =  dateObj.getHours();
var current_minutes = dateObj.getMinutes();
var current_seconds =  dateObj.getSeconds();

//connect to mongodb
var url = "mongodb+srv://nssdeliverywebapp:gamegame@rest.woruh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

function register(record){

  return new Promise((resolve,reject)=>{
    MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true},function(err, db) {
      if (err){
        console.log(err);
        reject('failed');
      };
      var dbo = db.db("nssfdp");
      dbo.collection(String(month)).insertOne(record, function(err, res) {
        if (err){
          console.log(err)
          reject('failed');
        };
        console.log("record inserted");
        db.close();
        resolve('success')
      });
    });
  });

}

function updateDnOs(DnOs){

  return new Promise((resolve,reject)=>{
    MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true},function(err, db) {
      if (err){
        console.log(err);
        reject('failed');
      };
      var dbo = db.db("nssfdp");
      dbo.collection('DnOs').insertMany(DnOs, function(err, res) {
        if (err){
          console.log(err)
          reject('failed');
        };
        console.log("record inserted");
        db.close();
        resolve('success')
      });
    });
  });

}

function updateDepartments(departments){
  
  return new Promise((resolve,reject)=>{
    MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true},function(err, db) {
      if (err){
        console.log(err);
        reject('failed');
      };
      var dbo = db.db("nssfdp");
      dbo.collection('Departments').insertMany(departments, function(err, res) {
        if (err){
          console.log(err)
          reject('failed');
        };
        console.log("record inserted");
        db.close();
        resolve('success')
      });
    });
  });

}

function lookup(query){
  return new Promise((resolve,reject)=>{
    MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true},function(err, db) {
      if (err){
        console.log(err);
        reject('failed');
      };
      var dbo = db.db("nssfdp");
      let ress = {};
      dbo.collection(String(month)).find({}).toArray(function(err, result) {
        if (err){
          console.log(err)
          reject('failed');
        };
        //console.log(result);

        for(let val of result){
          //console.log(val)
          if(val.assigned_key === query || val.phone === query){
            console.log(val)
            ress = {
              name: String(val.name),
              district: String(val.district),
              organization: String(val.organization),
              phone: String(val.phone),
              email: String(val.email),
              assigned_key: String(val.assigned_key)
            }
      
          }
        }
        db.close();
        resolve(ress);
      });
    });

  });
}

function getDnOs(district){
  return new Promise((resolve,reject)=>{
    MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true},function(err, db) {
      if (err){
        console.log(err);
        reject('failed');
      };
      var dbo = db.db("nssfdp");
      var query = { district: district };
      dbo.collection('DnOs').find(query, { projection: { _id: 0, organization: 1, district: 1 }}).toArray(function(err, result) {
        if (err){
          console.log(err)
          reject('failed');
        };

        db.close();
        resolve(result);
      });
    });

  });
}

function getDepartments(organization){
  return new Promise((resolve,reject)=>{
    MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true},function(err, db) {
      if (err){
        console.log(err);
        reject('failed');
      };
      var dbo = db.db("nssfdp");
      var query = { organization: organization };
      dbo.collection('Departments').find(query, { projection: { _id: 0, organization: 1, department: 1 }}).toArray(function(err, result) {
        if (err){
          console.log(err)
          reject('failed');
        };

        db.close();
        resolve(result);
      });
    });

  });

}

async function sendMail(name, message){
  return new Promise((resolve,reject)=>{

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tipy.llc@gmail.com',
        pass: 'Dzogbewu@1'
      }
    });
    
    var mailOptions = {
      from: 'tipy.llc@gmail.com',
      to: 'coffiejasoncj@gmail.com',
      subject: name,
      text: message
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        reject('failed');
      } else {
        console.log('Email sent: ' + info.response);
        resolve('success');
      }
    }); 

  });
}

var assignedkeys = [];

app.post('/register',async(req,res)=>{

    //console.log(req.body);

    var min = 1000;
    var max = 9999;
    var assigned_key =  'NSS'+month+'0'+(String(Math.random()).substring(2,7));

    let record = {
      "id": req.body.pushid,
      "name": req.body.name,
      "phone": req.body.phone,
      "email": req.body.email,
      "district": req.body.district,
      "organization": req.body.organization,
      "paymentreference": req.body.paymentreference,
      "time": current_hour+':'+current_minutes+':'+current_seconds,
      "assigned_key": assigned_key
    };

    register(record).then((value)=>{
      console.log(value);
      if(value === 'success'){
        res.send({
          status: 200,
          assigned_key: assigned_key
        });
      }
      else{
        res.sendStatus(500);
      }
    });

});

app.post('/lookup',async(req,res)=>{
  lookup(req.body.query).then((value)=>{
    //console.log(value);
    if(value === 'failed'){
      res.sendStatus(500);
    }
    else{
      res.send(value)
    }
  });
});

app.post('/sendmail', async(req,res)=>{
  console.log('sending mail');
  sendMail(req.body.name,req.body.message).then((value)=>{
    if(value === 'success'){
      res.sendStatus(200);
    }
    else{
      res.sendStatus(500);
    }
  })

});

app.post('/updateDnOs',async(req,res)=>{

  updateDnOs(req.body.data).then((value)=>{
    console.log(value);
    if(value === 'success'){
      res.sendStatus(200);
    }
    else{
      res.sendStatus(500);
    }
  });
});

app.post('/updateDepartments', async(req,res)=>{
  /*
       "data" : [
    { "organization": "UG (University of Ghana)", "department": "UG Business School"},
    { "organization": "UG (University of Ghana)", "department": "UG Engineering School"},
    { "organization": "UG (University of Ghana)", "department": "UG Law School"},
    { "organization": "UG (University of Ghana)", "department": "UGCS Computing systems"},
    { "organization": "UG (University of Ghana)", "department": "UG Balme Library"},
    { "organization": "UG (University of Ghana)", "department": "UG Accounts Office"},
    { "organization": "UG (University of Ghana)", "department": "UG Registry"}
  ]
  */

  updateDepartments(req.body.data).then((value)=>{
    console.log(value);
    if(value === 'success'){
      res.sendStatus(200);
    }
    else{
      res.sendStatus(500);
    }
  });

});

app.get('/getDepartments/:organization', async(req,res)=>{
  getDepartments(req.params.organization).then((value)=>{
    //console.log(value);
    if(value === 'failed'){
      res.sendStatus(500);
    }
    else{
      res.send(value)
    }
  });
});

app.get('/getDnOs/:district', async(req,res)=>{
  getDnOs(req.params.district).then((value)=>{
    //console.log(value);
    if(value === 'failed'){
      res.sendStatus(500);
    }
    else{
      res.send(value)
    }
  });
});

app.get('/gettime',(req,res)=>{
  var current_hour =  dateObj.getHours();
  var current_minutes = dateObj.getMinutes();
  var current_seconds =  dateObj.getSeconds();

  res.send({'result': current_hour+':'+current_minutes+':'+current_seconds})
});

app.get('/',(req,res)=>{
	res.sendStatus(200)
});

const port = process.env.PORT || '5000';
app.listen(port, () => console.log('Server started on port '+port));