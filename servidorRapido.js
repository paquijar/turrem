const Influx = require('influx')
const express = require('express')
const http = require('http')
const os = require('os')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const app = express()
const influx = new Influx.InfluxDB('http://localhost:8086/hola')
const salt = bcrypt.genSaltSync(10);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function usuario(user_name,password,response) {
    influx.query('select * from usuario').then(results => {
        var ayud=JSON.stringify(results[results.length-1]);
    ayud = ayud.substring(ayud.indexOf("contraseña")+13,ayud.length);
    var contraseña = ayud.substring(0,ayud.indexOf("\""));
    ayud = ayud.substring(ayud.indexOf("correo")+9,ayud.length);
    var correo = ayud.substring(0,ayud.indexOf("\""));
    if (user_name === correo && bcrypt.compareSync(password, contraseña) ) {
        response.end("yes");
    }
    else {response.end("no")}
});
}

function cambiar(pass_actual, pass_nueva, response) {

    influx.query('select * from usuario').then(results => {
        var ayud=JSON.stringify(results[results.length-1]);
    ayud = ayud.substring(ayud.indexOf("contraseña")+13,ayud.length);
    var contraseña = ayud.substring(0,ayud.indexOf("\""));
    if ( bcrypt.compareSync(pass_actual, contraseña) ) {
        var hash = bcrypt.hashSync(pass_nueva, salt);
        var correo1= 'mauriciohoyosardila@gmail.com';
        //console.log(pass_actual+" "+pass_nueva);
        influx.dropSeries({ measurement: m => m.name('usuario') });
        setTimeout( function (){influx.writePoints([
            {
                measurement: 'usuario',
                fields: {correo: correo1, contraseña: hash, value: 0},
            }
        ]);
            response.end("yes");}, 100);
    }
    else {response.end("no")}
});

}


app.get('/',function(request, response){
  response.sendFile(__dirname+'/interfaz_grafica/login.html');
});

app.get('/menu',function(request, response){
  response.sendFile(__dirname+'/interfaz_grafica/menu.html');
});

app.get('/cambiar',function(request, response){
  response.sendFile(__dirname+'/interfaz_grafica/cambiarContraseña.html');
});

app.get('/olvidar',function(request, response){
  response.sendFile(__dirname+'/interfaz_grafica/restaurarContraseña.html');
});


app.use(express.static(__dirname + '/interfaz_grafica/public_html/css'));


app.post('/login',function(request,response){

    var user_name=request.body.user;
    var password=request.body.password;
    usuario(user_name,password,response);
});

app.post('/cambiar',function(request,response){

    var passActual=request.body.passActual;
    var passNueva=request.body.passNueva;
    cambiar(passActual, passNueva, response);

});


app.listen(8083, function(){
  console.log('Server Express Ready!');
});

