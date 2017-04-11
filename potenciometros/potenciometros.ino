const int analogTemp =A0;
const int analogPres =A1;

void setup(){

  Serial.begin(9600);
}

void loop(){
Serial.println(analogRead(analogTemp));
delay(3000);
Serial.println(analogRead(analogPres));
delay(3000);
  
}
