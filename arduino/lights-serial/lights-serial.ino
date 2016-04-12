#include <Adafruit_NeoPixel.h>

#define LED_STRIP_PIN         6

#define NUM_PIXELS_PER_STRIP  150

#define BATCH_LENGTH  30

Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NUM_PIXELS_PER_STRIP, LED_STRIP_PIN, NEO_GRB + NEO_KHZ800);


void setup() {
  Serial.begin(115200);

  pixels.begin();

  turnOffLedStrips();

//  Serial.println("Started");
//  Serial.println("OK");

}

int parseChar(char chVal) {
  int val = constrain(chVal, 33, 96)-33; // 0-63 values encoded ASCII from "!" to "`"
  val = constrain((val+1) << 2, 0, 255);
  if (val == 4) {
    val = 0;
  }
  return val;
}

String str;

void turnOffLedStrips() {
  for (int i=0; i<NUM_PIXELS_PER_STRIP; i+=1) {
    pixels.setPixelColor(i, pixels.Color(0, 0, 0));
  }
  pixels.show();
//  delay(50);
  Serial.println("OK Reset");
}

void driveLedStrip() {
    int batchIdx = constrain((char)(str.charAt(1)) - 65, 0, (NUM_PIXELS_PER_STRIP/BATCH_LENGTH)-1);
    int numTriplesInCommand = (str.length()-2) / 3;
    int numLEDsToSet = min(numTriplesInCommand, BATCH_LENGTH);
    int bufIdx = 2;
    int r, g, b;
    for (int i=0; i<numTriplesInCommand; i+=1) {
      r = parseChar(str.charAt(bufIdx++));
      g = parseChar(str.charAt(bufIdx++));
      b = parseChar(str.charAt(bufIdx++));
      pixels.setPixelColor(i + batchIdx*BATCH_LENGTH, pixels.Color(r, g, b));
    }
    Serial.print("OK set ");
    Serial.print(numLEDsToSet);
    Serial.print(" LEDs in batch ");
    Serial.println(batchIdx);
//    pixels->show();
//    delay(50);
}


void loop() {
  char command;
  while (Serial.available() > 0) {
    str = Serial.readStringUntil('\n');
    command = str.charAt(0);

    if (command == 'A') {
      driveLedStrip();
    } else if (command == 'B') {
      pixels.show();
      Serial.println("OK Show");
    } else if (command == '0') {
      turnOffLedStrips();
    } else {
      Serial.print("ERROR Unknown command: ");
      Serial.println(command);
    }
//    Serial.println("OK");
  }
}








