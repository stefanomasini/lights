#include <Wire.h>

#define SLAVE_ADDRESS 0x04

#define CMD_SET_THRESHOLD_A  1
#define CMD_SET_DEBOUNCE_A   2
#define CMD_SET_THRESHOLD_B  3
#define CMD_SET_DEBOUNCE_B   4

//#define LED_PIN  13      // led connected to digital pin 13

const int knockSensor_A = A0; // the first piezo is connected to analog pin 0
unsigned int threshold_A = 10;  // threshold value to decide when the detected sound is a knock or not
unsigned int debounceMillis_A = 20;

const int knockSensor_B = A1; // the second piezo is connected to analog pin 1
unsigned int threshold_B = 10;  // threshold value to decide when the detected sound is a knock or not
unsigned int debounceMillis_B = 20;


volatile bool hasKnocked_A = false;
unsigned long timeKnocked_A = 0;
volatile bool hasKnocked_B = false;
unsigned long timeKnocked_B = 0;
unsigned long now;

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600); // start serial for output
  // initialize i2c as slave
  Wire.begin(SLAVE_ADDRESS);
  
  // define callbacks for i2c communication
  Wire.onReceive(receiveData);
  Wire.onRequest(sendData);
  
  hasKnocked_A = false;
  hasKnocked_B = false;
  
  Serial.println("Ready!");
}

void loop() {
  now = millis();
  unsigned int sensorReading = analogRead(knockSensor_A);
  if (sensorReading > threshold_A && (now - timeKnocked_A) > debounceMillis_A) {
    timeKnocked_A = millis();
    hasKnocked_A = true;
    Serial.println("Knock A!");
  }
  sensorReading = analogRead(knockSensor_B);
  if (sensorReading > threshold_B && (now - timeKnocked_B) > debounceMillis_B) {
    timeKnocked_B = millis();
    hasKnocked_B = true;
    Serial.println("Knock B!");
  }
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
  byte data[] = {(hasKnocked_A ? 1 : 0), (hasKnocked_B ? 1 : 0)};
  Wire.write(data, 2);
  hasKnocked_A = false;
  hasKnocked_B = false;
}
