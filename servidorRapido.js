const Influx = require('influx')
const express = require('express')
const http = require('http')
const os = require('os')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const sendemail = require('node-mandrill')('dde5db3072b59e26e113e68f56c93010-us15')
const app = express()
const influx = new Influx.InfluxDB('http://localhost:8086/hola')
const salt = bcrypt.genSaltSync(10);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function login(user_name,password,response) {
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
        else {response.end("no");}
    });
}

function recuperar(code, pass_nueva, response) {
    influx.query('select * from codigo_recuperacion').then(results => {
        var ayud=JSON.stringify(results[results.length-1]);
        ayud = ayud.substring(ayud.indexOf("codigo")+9,ayud.length);
        var codigo = ayud.substring(0,ayud.indexOf("\""));
        var correo1= 'mauriciohoyosardila@gmail.com';
        if ( bcrypt.compareSync(code, codigo) ) {
            var hash = bcrypt.hashSync(pass_nueva, salt);
            influx.dropSeries({ measurement: m => m.name('codigo_recuperacion') });
            influx.dropSeries({ measurement: m => m.name('usuario') });
            setTimeout( function (){influx.writePoints([
                {
                    measurement: 'usuario',
                    fields: {correo: correo1, contraseña: hash, value: 0},
                }
            ]);
                response.end("yes");}, 100);
            }
        else {response.end("no");}
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
    login(user_name,password,response);
});

app.post('/cambiar',function(request,response){

    var passActual=request.body.passActual;
    var passNueva=request.body.passNueva;
    cambiar(passActual, passNueva, response);

});

app.post('/generar_codigo',function () {
    var code = Math.round(Math.random()*10000);
    console.log(code);
/**    sendemail('/messages/send', {
        message: {
            to: [{email: 'mauriciohoyosardila@gmail.com', name: 'mauricio'}],
            from_email: 'mauriciohoyosardila@gmail.com',
            subject: "Hey, what's up?",
            text: "Hello"
        }
    }, function(error, response)
    {
        //uh oh, there was an error
        if (error) console.log( JSON.stringify(error) );

        //everything's good, lets see what mandrill said
        else console.log(response);
    });
 */
    var hash = bcrypt.hashSync(code.toString(), salt);
    influx.writePoints([
        {
            measurement: 'codigo_recuperacion',
            fields: {codigo: hash, value: 0},
        }
    ]);

})

app.post('/recuperar',function(request,response){

    var code=request.body.code;
    var passNueva=request.body.passNueva;
    recuperar(code, passNueva, response);

});

app.listen(8083, function(){
  console.log('Server Express Ready!');
});

