var express = require('express');
var app = express();

app.get('/',function(request, response){
  response.sendFile(__dirname+'/index.html');
});

app.get('/hola',function(request, response){
  response.sendFile(__dirname+'/segunda.html');
});

app.listen(8086, function(){
  console.log('Server Express Ready!');
});