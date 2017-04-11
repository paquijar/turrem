#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Código tomado de la Web del Programador
# http://www.lawebdelprogramador.com

import smtplib, getpass, os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email.encoders import encode_base64

print("** Enviar email con Gmail **")
user = "salasturrem@gmail.com"
password = "turrem2017*"

#Para las cabeceras del email
destinatario = "dillanma1@gmail.com"
asunto = "Nada"
mensaje = "hola"
archivo =  ''

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
