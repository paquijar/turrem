#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import time
import random
import serial
import smtplib, getpass, os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email.encoders import encode_base64

print("Program Started")
ser = serial.Serial('/dev/ttyACM0',9600) #update with port arduino

while True: 

    direccion= "192.168.23.3:8086/write?db=Turrem"
    direccion2="192.168.23.3:8086/query?db=Turrem"
        
  
    #if last_value[0]['value']==1.0: 
    #    os.system('fswebcam image.jpg')#command console python/raps
    #    os.system('python2 enviarFoto.py')

    def enviarCorreo(Asunto,Mensaje,Archivo):
                
        print("** Enviar email con Gmail **")
        user = "salasturrem@gmail.com"
        password = "turremsalas2017*"
        #Para las cabeceras del email
        destinatario = "dillanma1@gmail.com"
        asunto = Asunto
        mensaje = Mensaje
        archivo =  Archivo
        #Host y puerto SMTP de Gmail
        gmail = smtplib.SMTP('smtp.gmail.com', 587)
        #protocolo de cifrado de datos utilizado por gmail
        gmail.starttls()
        #Credenciales
        gmail.login(user, password)
        #muestra la depuración de la operacion de envío 1=true
        gmail.set_debuglevel(1)
        header = MIMEMultipart()
        header['Subject'] = asunto
        header['From'] = user
        header['To'] = destinatario
        mensaje = MIMEText(mensaje, 'html') #Content-type:text/html
        header.attach(mensaje)
        if (os.path.isfile(archivo)):
            print ("Mandando archivo")
            adjunto = MIMEBase('application', 'octet-stream')
            adjunto.set_payload(open(archivo, "rb").read())
            encode_base64(adjunto)
            adjunto.add_header('Content-Disposition', 'attachment; filename="%s"' % os.path.basename(archivo))
            header.attach(adjunto)
        #Enviar email
        gmail.sendmail(user, destinatario, header.as_string())
        #Cerrar la conexión SMTP
        gmail.quit()
        

    def enviarDato(valor, direccion,tabla):
        os.system('curl -i -XPOST "%s" --data-binary "%s value=%s"'%(direccion,tabla,valor))

    def recibirDato(direccion2,tabla):
        val=os.popen('curl -G "%s" --data-urlencode "q=select * from %s"'%(direccion2,tabla)).read()
        otro=""
        
        val=val[::-1]   
        for j in range(len(val)):
            if(val[j].isdigit() or val[j]=='.'):
                    otro+=val[j]
                    if(val[j+1].isdigit()!=True and val[j+1]!='.'):
                        break
        otro=otro[::-1]
        print (otro)
        return otro
  
    def prenderCamara(camara):
        print ("soy camara",camara)
        if camara=='1':
            os.system("sudo motion start")

        if camara=='0':
            os.system("sudo motion stop")

    def prenderCompresores():
              
        ser.write('1')
        print("Prendido")
        time.sleep(15)

    def apagarCompresores():
       
        ser.write('2')
        print("Apagado")
        time.sleep(15)

    def consultarDatos():
        
        read_serial = ser.readline()#read serial
        tempReading = (float(read_serial))#convert to float
        print(read_serial)#prints serial reading to python
        enviarDato(tempReading, direccion,"Temperaturas")
        
        read_serial = ser.readline()
        presReading = (float(read_serial))#convert to float
        print(read_serial)#prints serial reading to python
        enviarDato(presReading, direccion,"Presiones")

        valorCamara= recibirDato(direccion2,"Camara")
        #prenderCamara(valorCamara)
        
        if (int(presReading)>500 or int(tempReading)>500):
            apagarCompresores()
            os.system('fswebcam image.jpg')           
            enviarCorreo("Alerta en compresores","Los compresores han alcanzado niveles criticos","/home/pi/Desktop/turrem/image.jpg")
       
        
    
    valorCompresor= recibirDato(direccion2,"Compresores")   

    if (valorCompresor == '1'):
        prenderCompresores()
        consultarDatos()
     
    if(valorCompresor=='0'):
        apagarCompresores()
    
    
