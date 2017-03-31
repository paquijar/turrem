const express = require('express');
const epimetheus = require('epimetheus');

const app = express();
epimetheus.instrument(app);
 

app.get('/',function(request, response){
  response.sendFile(__dirname+'/index.html');
});

app.listen(3000, () {
  console.log('express server listening on port 3000');
});