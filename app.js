
var socketio = require('socket.io')
  , express = require('express')
  , http = require('http')
  , path = require('path')
  , mongodb = require('mongodb')
  , yahooFinance = require('yahoo-finance');
  
var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);
require('dotenv').config();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'client')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var MongoClient = mongodb.MongoClient;
MongoClient.connect(process.env.MONGO_URI,function(err,db){
    if(err) throw err;
  io.on('connection',function(socket){
    var col = db.collection('symbols');
    getData();
 
 function getData(){
    col.find({type: 'symbols'},{_id: 0, names:1}).toArray(function(err, doc){
       if(err)throw err;
       else{
      getComp(doc[0].names);
       }
    });
  };
  
   function getComp(data){
     var names = data.reduce(function(a, b) { 
  return a.concat(b);
      }, []);
    yahooFinance.snapshot({
      symbols: names,
      fields: ['s','n']
      }, function (err, snapshot) {
        if(err) throw err;
        else{
        socket.emit('output', snapshot);
        }
     });
  }
  
   socket.on('check', function(ticker){
   yahooFinance.snapshot({
      symbol: ticker,
      fields: ['s','n']
      }, function (err, snapshot) {
        if(err) console.log("Not Valid");
        else{
            socket.emit('isValid', snapshot);
            addTicker(ticker);
            }
        });
    });
    
  function addTicker(ticker){
   col.findAndModify({type: 'symbols'}, {},{$push: {names: ticker} },{new: true},
   function(err, doc){
     if(err)throw err;
     else{
       console.log(doc.value.names);
     }
    });
  };
    
  socket.on('remove',function(div){
    var x = div;
    col.findAndModify({type: 'symbols'},{},{$pull: {names: x} },{new: true},
    function(err, doc){
      if(err)throw err;
     else{
      socket.emit('update', doc.value.names);
     }
    });
  });
    
  });
});


app.get('/', function(req, res){
  res.sendfile('client/index.html');
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
