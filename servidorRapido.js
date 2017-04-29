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
app.use(express.static(__dirname + '/interfaz_grafica/public_html/css'));
app.set('view engine', 'ejs');

var codeAuten;

function login(user_name,password,res) {
    influx.query('select * from usuario').then(results => {
        var ayud=JSON.stringify(results[results.length-1]);
        ayud = ayud.substring(ayud.indexOf("contraseña")+13,ayud.length);
        var contraseña = ayud.substring(0,ayud.indexOf("\""));
        ayud = ayud.substring(ayud.indexOf("correo")+9,ayud.length);
        var correo = ayud.substring(0,ayud.indexOf("\""));
        if (user_name === correo && bcrypt.compareSync(password, contraseña) ) {
            codeAuten = Math.round(Math.random()*100000);
            codeAuten=codeAuten.toString()
            res.end(codeAuten);
            logueado=true;
        }
        else {res.end("0");}
    });
}

function cambiar(pass_actual, pass_nueva, res) {

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
                codeAuten = Math.round(Math.random()*100000);
                codeAuten=codeAuten.toString()
                res.end(codeAuten);}, 100);
        }
        else {res.end("0");}
    });
}

function recuperar(code, pass_nueva, res) {
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

                res.end("yes");}, 100);
            }
        else {res.end("no");}
    });
}

app.get('/',function(req, res){
  //res.sendFile(__dirname+'/interfaz_grafica/login.html');
    res.render('login');
});

app.get('/menu',function(req, res){
    if(req.param('codigo')==codeAuten) {
        codeAuten="0";
        res.render('menu');
    }
    else{
        res.render('login');
    }
});

app.get('/cambiar',function(req, res){
    if(req.param('codigo')==codeAuten) {
        codeAuten="0";
        res.render('cambiarContraseña');
    }
    else{
        res.render('login');
    }
});

app.get('/olvidar',function(req, res){
  res.render('restaurarContraseña');
});



app.post('/login',function(req,res){
    var user_name=req.body.user;
    var password=req.body.password;
    login(user_name,password,res);
});

app.post('/cambiar',function(req,res){

    var passActual=req.body.passActual;
    var passNueva=req.body.passNueva;
    cambiar(passActual, passNueva, res);

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
    }, function(error, res)
    {
        //uh oh, there was an error
        if (error) console.log( JSON.stringify(error) );

        //everything's good, lets see what mandrill said
        else console.log(res);
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

app.post('/recuperar',function(req,res){

    var code=req.body.code;
    var passNueva=req.body.passNueva;
    recuperar(code, passNueva, res);

});

app.post('/menu',function (req,res) {
    codeAuten = Math.round(Math.random()*100000);
    codeAuten=codeAuten.toString()
    res.end(codeAuten);
});

app.listen(8083, function(){
  console.log('Server Express Ready!');
});

