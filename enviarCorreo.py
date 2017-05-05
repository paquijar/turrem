#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Código tomado de la Web del Programador
# http://www.lawebdelprogramador.com
import sys, json,smtplib, getpass, os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email.encoders import encode_base64

#Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    # Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

#get our data as an array from read_in()
lines = read_in()
# Sum  of all the items in the providen array
total_sum_inArray = 0
for item in lines:
    total_sum_inArray += item

#return the sum to the output stream
print (total_sum_inArray)
print("** Enviar email con Gmail **")
user = "salasturrem@gmail.com "
#password = getpass.getpass("clave del correo del remitente")
password =""
#Para las cabeceras del email
destinatario = "dillanma1@gmail.com"
asunto = "Restaurar Contraseña"
mensaje = ("Su código de verificación es: "+str(total_sum_inArray))
#archivo =  ''
#Host y puerto SMTP de Gmail
gmail = smtplib.SMTP('smtp.gmail.com', 587)
#protocolo de cifrado de datos utilizado por gmail
gmail.starttls()
#Credenciales
gmail.login(user, password)
#muestra la depuración de la operacion de envío 1=true
#gmail.set_debuglevel(1)
header = MIMEMultipart()
header['Subject'] = asunto
header['From'] = user
header['To'] = destinatario
mensaje = MIMEText(mensaje, 'html') #Content-type:text/html
header.attach(mensaje)
"""if (os.path.isfile(archivo)):
 print ("Mandando archivo")
 adjunto = MIMEBase('application', 'octet-stream')
 adjunto.set_payload(open(archivo, "rb").read())
 encode_base64(adjunto)
 adjunto.add_header('Content-Disposition', 'attachment; filename="%s"' % os.path.basename(archivo))
 header.attach(adjunto)"""

#Enviar email
gmail.sendmail(user, destinatario, header.as_string())

#Cerrar la conexión SMTP
gmail.quit()

