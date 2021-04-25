var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var rand = require("random-key");

var cors = require('cors');
const bp = require("body-parser");
var app = express();

app.use(cors());
app.use(bp.json());
app.use(bp.urlencoded({extended: true}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get("/admin", function(req, res){
  let printForm = ` <h1>Admin login</h1>
                    <p>Login here by entering the password:</p>
                    <form action="/admin/logged" method="POST">
                    <input type="password" placeholder="password" name="password">
                    <button type="submit">Sign in</button>
                    </form>`
  res.send(printForm);
});
  

//MongoDB data, handeling data
const MongoClient = require('mongodb').MongoClient;
const { json } = require('body-parser');
const uri = "mongodb+srv://judith:gammelli@cluster0.6la81.mongodb.net/Cluster0?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  if (err) return console.error(err);
  console.log('Connected to Database');

  const db = client.db("Registerd-users");
  const registeredUsers = db.collection("reg");

  app.post("/newUser", (req, res)=>{
    let newUser = req.body;
    newUser.id = rand.generate();

    registeredUsers.insertOne(newUser)
    .then(result =>{
      console.log(result);
      res.redirect("/");
    })
    .catch(error => console.error(error));
  });

  app.post('/api/login/', (req, res) => {
    console.log('Req body in login ', req.body)
    registeredUsers.findOne( 
      { $and: [ 
        { email: req.body.email }, 
        { password: req.body.password } 
      ] }, 
     (err, result) => {
      if(err) {
        res.status(500).send(err);
        return;
      }
      if(!result) {
          data = "wrong";
          console.log(data);
          res.status(401).send(data);
      } else {
          data = result.id;
          res.json(data); 
        }
    });
  });

  app.post('/getUser/', (req, res) => {
    registeredUsers.findOne({ id: req.body.id }, 
     (err, result) => {
      if(err) {
        res.status(500).send(err);
        return;
      }else {
        data = {email: result.email, subscription: result.subscription};
        res.json(data);
        }
    });
  });

  app.post('/update/', (req, res) =>{
    let id = req.body.id;
    registeredUsers.findOne({ id: id }, 
      (err, result) => {
       if(err) {
         res.status(500).send(err);
         return;
       }else {
          console.log("the result is:", result);
          let oldSub = {id: result.id, subscription: result.subscription};
          let newSub = {$set: {subscription: !result.subscription}};
          console.log("the oldSub is :", oldSub);
          
         registeredUsers.updateOne(oldSub, newSub, function(err, res){
          if (err) throw err;
         });
         let send= {subscription: result.subscription, email: result.email};

         res.json(send);
        }
     });
  });


  app.post("/admin/logged", function(req, res){
    if(req.body.password == "admin"){
  
    let printForm = 

      registeredUsers.find({}).toArray(function(err, result){
        if(err) throw err;
        console.log(result);

        let allUser = "<h1>Admin</h1>";
        let user = "<h3>All users: </h3>";     
        let subUser = "<h3>Subscribed users: </h3>";


        for(mail in result){
          user += "<div>" + result[mail].email + "</div>";
        }

        allUser += user;

        for(sub in result){
          if(result[sub].subscription === true){
            subUser += "<div>" + result[sub].email + "</div>";
          }
        }

        allUser += subUser;

        console.log(allUser);
        res.send(allUser);
      
      });
      
    }else{
    let printForm = ` <h1>Wrong password!</h1>`
    res.send(printForm);
    }
  });
  //client.close();
});

module.exports = app;
