const Influx = require('influx')
const express = require('express')
const http = require('http')
const os = require('os')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const app = express()
const influx = new Influx.InfluxDB('http://localhost:8086/Turrem')
const salt = bcrypt.genSaltSync(10);
const PythonShell = require('python-shell')
var pyshell= new PythonShell('enviarCorreo.py');
var date= new Date();
const HashMap = require('hashmap')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/interfaz_grafica/public_html/css'));
app.set('view engine', 'ejs');

var codeAuten=0;
var horarioInicio = new HashMap();
var horarioApagado = new HashMap();
var mesActual = (date.getMonth()+1).toString();
var diaActual = date.getDate().toString();
var minActual = date.getMinutes().toString();
var horaActual = date.getHours().toString();
var estado = "apagado";
influx.writePoints([{
    measurement: 'Compresores',
    fields: {value: 0},
}]);
// las posiciones del array son dia, mes, hora, minuto
var inicioHoy = [diaActual,mesActual,"0","0"];
var apagadoHoy = [diaActual,mesActual,"0","0"];

// funcion que se encarga de capturar el tiempo actual y de prender y apagar los compresores a la hora asignada del mismo dia
setInterval(function () {
    date= new Date();
    // captura de tiempo actual ================================
    //console.log(minActual+"  "+date.getMinutes().toString());
    if ( minActual != date.getMinutes().toString()){
        minActual = date.getMinutes().toString();
        if (minActual == "0") horaActual = date.getHours().toString();
    }
    if (diaActual != date.getDate().toString() ){

        diaActual = date.getDate().toString();
        if (diaActual == "1")   mesActual = (date.getMonth()+1).toString();
    }
    //==============================================

    // encendido y apagado de los compresores, modificacion de la base de datos para porder ser prendidos ================
    if (mesActual == inicioHoy[1]) {
        if (diaActual == inicioHoy[0]) {
            if (minActual == inicioHoy[3]) {
                if (horaActual == inicioHoy[2]) {
                    if (estado == "apagado") {
                        estado = "prendido";
                        influx.dropSeries({ measurement: m => m.name('Compresores')});
                        setTimeout(function () {
                            influx.writePoints([{
                                measurement: 'Compresores',
                                fields: {value: 1},
                            }]);
                        },100);
                    }
                }
            }
        }
    }
    if (mesActual == apagadoHoy[1]) {
        if (diaActual == apagadoHoy[0]) {
            if (minActual == apagadoHoy[3]) {
                if (horaActual == apagadoHoy[2]) {
                    if (estado == "prendido") {
                        estado = "apagado"
                        influx.dropSeries({ measurement: m => m.name('Compresores')});
                        setTimeout(function () {
                            influx.writePoints([{
                                measurement: 'Compresores',
                                fields: {value: 0},
                            }]);
                        },100);
                    }
                }
            }
        }
    }
    //========================================================
    //console.log(diaActual+"/"+mesActual+"   "+ horaActual+":"+minActual+"  "+estado+"inicioHoy: "+inicioHoy+"apagadoHoy: "+apagadoHoy);
},20000);

//funcion que se encarga de realizar todas las verificaciones cuando un usuario esta intentando loguearse
function login(user_name,password,res) {
    influx.query('select * from Usuario').then(results => {
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

//funcion que se encarga del cambio de la contraseña actual
function cambiar(pass_actual, pass_nueva, res) {

    influx.query('select * from Usuario').then(results => {
        var ayud=JSON.stringify(results[results.length-1]);
        ayud = ayud.substring(ayud.indexOf("contraseña")+13,ayud.length);
        var contraseña = ayud.substring(0,ayud.indexOf("\""));
        if ( bcrypt.compareSync(pass_actual, contraseña) ) {
            var hash = bcrypt.hashSync(pass_nueva, salt);
            var correo1= 'mauriciohoyosardila@gmail.com';
            //console.log(pass_actual+" "+pass_nueva);
            influx.dropSeries({ measurement: m => m.name('Usuario') });
            setTimeout( function (){
                influx.writePoints([{
                    measurement: 'Usuario',
                    fields: {correo: correo1, contraseña: hash, value: 0},
                }]);
                codeAuten = Math.round(Math.random()*100000);
                codeAuten=codeAuten.toString()
                res.end(codeAuten);
            },100);
        }
        else {res.end("0");}
    });
}

//funcion que se encarga de la recuperacion de contraseña(cambio de contraseña con codigo de recuperacion)
function recuperar(code, pass_nueva, res) {
    influx.query('select * from Codigo_recuperacion').then(results => {
        var ayud=JSON.stringify(results[results.length-1]);
        ayud = ayud.substring(ayud.indexOf("codigo")+9,ayud.length);
        var codigo = ayud.substring(0,ayud.indexOf("\""));
        var correo1= 'mauriciohoyosardila@gmail.com';
        if ( bcrypt.compareSync(code, codigo) ) {
            var hash = bcrypt.hashSync(pass_nueva, salt);
            influx.dropSeries({ measurement: m => m.name('Codigo_recuperacion') });
            influx.dropSeries({ measurement: m => m.name('Usuario') });
            setTimeout( function (){influx.writePoints([
                {
                    measurement: 'Usuario',
                    fields: {correo: correo1, contraseña: hash, value: 0},
                }
            ]);

                res.end("yes");}, 100);
            }
        else {res.end("no");}
    });
}

//se encarga del almacenaje de las horas de encendido y apagado
function guardar(mes, dia, hora, min, tipo, res) {
    //console.log(tipo);
    if (tipo ==="inicio"){
        if (horarioInicio.get(mes) != undefined){
            if (horarioInicio.get(mes).get(dia) != undefined){
                var mesage2 = dia.toString()+"/"+mes.toString()+"/"+hora.toString()+":"+min.toString()+
                    "/"+horarioInicio.get(mes).get(dia)[0]+":"+horarioInicio.get(mes).get(dia)[1];
                res.end(mesage2);
            }
            horarioInicio.get(mes).set(dia,[hora, min]);

        }
        else {
            horarioInicio.set(mes, new HashMap());
            horarioInicio.get(mes).set(dia, [hora, min]);

        }
        if (mes.toString() == mesActual){
            if (dia.toString() == diaActual){
                if(hora.toString() >= horaActual){
                    inicioHoy[2] = hora.toString();
                    inicioHoy[3] = min.toString();
                }
            }
        }
        //console.log(inicioHoy[1]+"/"+inicioHoy[0]+"  "+inicioHoy[2]+":"+inicioHoy[3])
        //console.log(horarioInicio.get(mes).get(dia));
//        console.log(date.getDate()+" "+date.getFullYear()+" "+date.getDay());
    }
    if (tipo ==="apagado"){
        if (horarioApagado.get(mes) != undefined){
            if (horarioApagado.get(mes).get(dia) != undefined){
                var mesage2 = dia.toString()+"/"+mes.toString()+"/"+hora.toString()+":"+min.toString()+
                    "/"+horarioApagado.get(mes).get(dia)[0]+":"+horarioApagado.get(mes).get(dia)[1];
                res.end(mesage2);
            }
            horarioApagado.get(mes).set(dia,[hora, min]);

        }
        else {
            horarioApagado.set(mes, new HashMap());
            horarioApagado.get(mes).set(dia, [hora, min]);

        }
        if (mes.toString() == mesActual){
            if (dia.toString() == diaActual){
                if(hora.toString() >= horaActual){
                    apagadoHoy[2] = hora.toString();
                    apagadoHoy[3] = min.toString();
                }
            }
        }
        //console.log(apagadoHoy[1]+"/"+apagadoHoy[0]+"  "+apagadoHoy[2]+":"+apagadoHoy[3])
        //console.log(horarioApagado.get(mes).get(dia));
//        console.log(date.getDate()+" "+date.getFullYear()+" "+date.getDay());
    }
    var mesage1 = dia.toString()+"/"+mes.toString()+"/"+hora.toString()+":"+min.toString();
    //console.log(mesage1);
    setTimeout( function () {
        res.end( mesage1);
    },200);

}

//get de la pagina principal
app.get('/',function(req, res){
  //res.sendFile(__dirname+'/interfaz_grafica/login.html');
    res.render('login');
});

//get del menu
app.get('/menu',function(req, res){
    if(req.param('codigo')==codeAuten) {
        codeAuten="0";
        res.render('menu');
    }
    else{
        res.render('login');
    }
});

//get para cambiar la contraseña actual
app.get('/cambiar',function(req, res){
    if(req.param('codigo')==codeAuten) {
        codeAuten="0";
        res.render('cambiarContraseña');
    }
    else{
        res.render('login');
    }
});

//get para recuperar la contraseña
app.get('/olvidar',function(req, res){
  res.render('restaurarContraseña');
});

//get para la programacion de horas
app.get('/programarHoras',function(req, res){
    if(req.param('codigo')==codeAuten) {
        codeAuten="0";
        res.render('programarHora');
    }
    else{
        res.render('login');
    }


});

//post que se encarga de la recoleccion de los datos cuando un usuario se loguea
app.post('/login',function(req,res){
    var user_name=req.body.user;
    var password=req.body.password;
    login(user_name,password,res);
});

//post que se encarga de la recoleccion de los datos cuando el usuario desea cambiar la contraseña
app.post('/cambiar',function(req,res){

    var passActual=req.body.passActual;
    var passNueva=req.body.passNueva;
    cambiar(passActual, passNueva, res);

});

//post que encarga de generar el codigo de recuperacion de la contraseña y envio de correo electronico con el codigo
app.post('/generar_codigo',function () {
    var code = Math.round(Math.random()*10000);
    console.log(code);
   /**
    var pyshell= new PythonShell('enviarCorreo.py');
    pyshell.send(JSON.stringify([code]));

    pyshell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        console.log(message);
    });

    pyshell.end(function (err) {
        if (err){
            throw err;
            console.log(err);
        };

        console.log('finished');

    });
*/

    var hash = bcrypt.hashSync(code.toString(), salt);
    influx.writePoints([
        {
            measurement: 'Codigo_recuperacion',
            fields: {codigo: hash, value: 0},
        }
    ]);

});

//post que se encarga de la recoleccion de los datos requeridos para la recuperacion de la contraseña
app.post('/recuperar',function(req,res){

    var code=req.body.code;
    var passNueva=req.body.passNueva;
    recuperar(code, passNueva, res);

});

//post que se encarga de asignar el codigo de seguridad para poder pasar de las demas paginas al menu de forma segura
app.post('/menu',function (req,res) {
    codeAuten = Math.round(Math.random()*100000);
    codeAuten=codeAuten.toString()
    res.end(codeAuten);
});

//post que se encarga de asignar el codigo de seguridad para poder pasar del menu a la programacion de horas de forma segura
app.post('/programarHoras',function(req,res){
    codeAuten = Math.round(Math.random()*100000);
    codeAuten=codeAuten.toString()
    res.end(codeAuten);
});

//post que se encarga de la recoleccion de los datos necesarios para poder  guardar la hora de inicio o apagado
app.post('/guardar',function (req,res) {
    var mes = req.body.mes;
    var dia = req.body.dia;
    var hora = req.body.hora;
    var min = req.body.min;
    var tipo = req.body.tipo;
    guardar(mes,dia,hora, min, tipo, res);
})

//llamado al local host para establecer el servidor
app.listen(8083, function(){
  console.log('Server Express Ready!');
});

