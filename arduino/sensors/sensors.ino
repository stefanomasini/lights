#include <Wire.h>

#define SLAVE_ADDRESS 0x04

#define CMD_SET_THRESHOLD_A  1
#define CMD_SET_DEBOUNCE_A   2
#define CMD_SET_THRESHOLD_B  3
#define CMD_SET_DEBOUNCE_B   4

#define LED_PIN  13      // led connected to digital pin 13

//const int knockSensor_A = A0; // the first piezo is connected to analog pin 0
unsigned int threshold_A = 10;  // threshold value to decide when the detected sound is a knock or not
const int knockSwitch_A = 2;
unsigned int debounceMillis_A = 5;

//const int knockSensor_B = A1; // the second piezo is connected to analog pin 1
unsigned int threshold_B = 10;  // threshold value to decide when the detected sound is a knock or not
const int knockSwitch_B = 3;
unsigned int debounceMillis_B = 20;


bool hasKnocked_A = false;
volatile bool knockToNotify_A = false;
unsigned long timeKnocked_A = 0;
bool hasKnocked_B = false;
volatile bool knockToNotify_B = false;
unsigned long timeKnocked_B = 0;
unsigned long now;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(knockSwitch_A, INPUT_PULLUP); // configure pin as an input and enable the internal pull-up resistor
  pinMode(knockSwitch_B, INPUT_PULLUP); // configure pin as an input and enable the internal pull-up resistor
  
  Serial.begin(9600); // start serial for output
  // initialize i2c as slave
  Wire.begin(SLAVE_ADDRESS);
  
  // define callbacks for i2c communication
  Wire.onReceive(receiveData);
  Wire.onRequest(sendData);
  
  hasKnocked_A = false;
  hasKnocked_B = false;
  knockToNotify_A = false;
  knockToNotify_B = false;
  
  Serial.println("Ready!");
}

void loop() {
  now = millis();  
  unsigned int sensorReading = digitalRead(knockSwitch_A);
  if (sensorReading == LOW) {
    if (!hasKnocked_A) {
      digitalWrite(LED_PIN, HIGH);
      hasKnocked_A = true;
      timeKnocked_A = now;
      knockToNotify_A = true;
    }
  } else {
    if ((now - timeKnocked_A) > debounceMillis_A) {
      digitalWrite(LED_PIN, LOW);
      hasKnocked_A = false;
    }
  }

  sensorReading = digitalRead(knockSwitch_B);
  if (sensorReading == LOW) {
    if (!hasKnocked_B) {
      hasKnocked_B = true;
      timeKnocked_B = now;
      knockToNotify_B = true;
    }
  } else {
    if ((now - timeKnocked_B) > debounceMillis_B) {
      hasKnocked_B = false;
    }
  }
  
//  unsigned int sensorReading = analogRead(knockSensor_A);
//  if (sensorReading > threshold_A && (now - timeKnocked_A) > debounceMillis_A) {
//    timeKnocked_A = now;
//    hasKnocked_A = true;
//    Serial.print("Knock A ");
//    Serial.println(sensorReading);
//  }
//  sensorReading = analogRead(knockSensor_B);
//  if (sensorReading > threshold_B && (now - timeKnocked_B) > debounceMillis_B) {
//    timeKnocked_B = now;
//    hasKnocked_B = true;
//    Serial.print("Knock B ");
//    Serial.println(sensorReading);
//  }
}

// callback for received data
void receiveData(int byteCount){
  int command = 0;
  int value = 0;
  int idx = 0;
  
  while (Wire.available()) {
    if (idx == 0) {
      command = Wire.read();
    } else {
      value = Wire.read();
    }
    if (idx == 0) {
      idx += 1;
    } else {
      idx = 0;
      executeCommand(command, value);
    }
  }
}

void executeCommand(int command, unsigned int value) {
  if (command == CMD_SET_THRESHOLD_A) {
    threshold_A = value;
  } else if (command == CMD_SET_DEBOUNCE_A) {
    debounceMillis_A = value;
  } else if (command == CMD_SET_THRESHOLD_B) {
    threshold_B = value;
  } else if (command == CMD_SET_DEBOUNCE_B) {
    debounceMillis_B = value;
  }
}

// callback for sending data
void sendData(){
  byte data[] = {(knockToNotify_A ? 1 : 0), (knockToNotify_B ? 1 : 0)};
  Wire.write(data, 2);
  knockToNotify_A = false;
  knockToNotify_B = false;
}
