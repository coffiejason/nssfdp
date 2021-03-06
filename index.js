const functions = require('firebase-functions');
const express = require('express');
var admin = require('firebase-admin');
var cors = require('cors');

var serviceAccount = require(__dirname+'/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://nssformdelivery-default-rtdb.firebaseio.com"
});

const app = express();
var db = admin.database();
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

var assignedkeys = [];
/*
function generateKey(){
  let key =  'NSS'+month+'0'+(String(Math.random()).substring(2,7));
   
  if(assignedkeys.includes(key))

  return
}*/

app.post('/register',async(req,res)=>{

    console.log(req.body);
    
    var pushid = db.ref('users/'+year+'/'+month).push().getKey();
    //MoMo Payment

    //After momo payment
    var min = 1000;
    var max = 9999;
    var assigned_key =  'NSS'+month+'0'+(String(Math.random()).substring(2,7));

    console.log(String(assigned_key));
  
    await db.ref('users/'+year+'/'+month).child(String(pushid)).set({
        id: pushid,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        district: req.body.district,
        organization: req.body.organization,
        paymentreference: req.body.paymentreference,
        assignedkey: assigned_key,
        time: current_hour+':'+current_minutes+':'+current_seconds
    }, async function(error) {
      if (error) {
        console.log(error);
        res.sendStatus(500);
      } else {
        res.send({
          res: 200,
          assigned_key: assigned_key
        });
      }
    });

    
    res.send();
});

app.post('/lookup',async(req,res)=>{

  const eventref = db.ref("users/"+year+"/"+month);
  const snapshot = await eventref.once('value');
  const value = snapshot.val();

  var data = Object.entries(value);

  var query = req.body.query;

  for(let val of data){

    var response;

    if(query === String(val[1].assignedkey) || query === String(val[1].phone)){
      
      response = {
        id: String(val[1].assignedkey),
        name: String(val[1].name),
        district: String(val[1].district),
        organization: String(val[1].organization),
        phone: String(val[1].phone),
        paymentmethod: String(val[1].paymentmethod)
      }

    }
  }

  res.send(response);

});

app.get('/verify_transaction/:reference',async(req,res)=>{

  console.log(req.params.reference);

  const options = {

    hostname: 'api.paystack.co',

    port: 443,

    path: '/transaction/verify/'+req.params.reference,

    method: 'GET',

    headers: {

      Authorization: ''

    }

  }

  https.request(options, res => {

    let data = ''

    resp.on('data', (chunk) => {

      data += chunk

    });

    resp.on('end', () => {

      console.log('1');
      //res.send(JSON.parse(data))

    })

  }).on('error', error => {

    console.error('0');
    //res.send(error)

  })
  res.sendStatus(200);
});

app.get('/verify_transaction2/:reference',async(req,res)=>{

  const options = {

    hostname: 'api.paystack.co',
  
    port: 443,
  
    path: '/transaction/verify/:'+req.params.reference,

    method: 'GET',

    headers: {

      Authorization: 'sk_live_0503c9bf4fc394674529dae02673cd4df8110f90'

    }
  
  }
  
  https.request(options, res => {
  
    let data = ''
  
    resp.on('data', (chunk) => {
  
      data += chunk
  
    });
  
    resp.on('end', () => {
  
      console.log(JSON.parse(data))
  
    })
  
  }).on('error', error => {
  
    console.error(error)
  
  })

  res.sendStatus(200);
});

app.get('/gettime',(req,res)=>{
  var current_hour =  dateObj.getHours();
  var current_minutes = dateObj.getMinutes();
  var current_seconds =  dateObj.getSeconds();

  res.send({'result': current_hour+':'+current_minutes+':'+current_seconds})
});

//exports.app = functions.https.onRequest(app);

const port = process.env.PORT || '5000';
app.listen(port, () => console.log('Server started on port '+port));


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
 