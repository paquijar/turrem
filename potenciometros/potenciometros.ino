const int analogTemp =A0;
const int analogPres =A1;

void setup(){

  Serial.begin(9600);
  pinMode(25,OUTPUT);
  pinMode(24,INPUT);
  pinMode(23,INPUT);
  pinMode(22,OUTPUT);
  digitalWrite(22,HIGH);
  
}

void loop(){
Serial.println(analogRead(analogTemp));
delay(5000);
Serial.println(analogRead(analogPres));
delay(5000);

if (Serial.available()>0){

  char c = Serial.read();
  
  if (c=='1'){
      digitalWrite(25,HIGH);    
  }else{
  
      digitalWrite(25,LOW);
  }
  
}
  
}
