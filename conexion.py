import serial
import os
from ubidots import ApiClient

print("Program Started")

api = ApiClient(token = '3Sbqx4FstAgSZbBgfojoqZ3rqaZKdE') #update token

my_temp = api.get_variable('5825d1d27625426c567e9653')#update variable ID

takePhoto = api.get_variable('5825d578762542094756e6c3')#update variable ID2

presion = api.get_variable('5825d1ec7625426d30cf7355')#update variable ID3

ser = serial.Serial('/dev/ttyACM0',9600) #update with port arduino

while True:
    last_value=takePhoto.get_values()#Get value arduino
    
    
    if last_value[0]['value']==1.0: 
        os.system('fswebcam image.jpg')#command console python/raps
        os.system('python2 enviarFoto.py')
        
    read_serial = ser.readline()#read serial
    tempReading = (float(read_serial))#convert to float
    new_value = my_temp.save_value({'value': tempReading})
    print(read_serial)#prints serial reading to python

    read_serial = ser.readline()
    presReading = (float(read_serial))#convert to float
    new_value2 = presion.save_value({'value': presReading})
    print(read_serial)#prints serial reading to python 
