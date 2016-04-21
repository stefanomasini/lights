#include <Adafruit_NeoPixel.h>

#define LED_STRIP_PIN         6
#define NUM_PIXELS_PER_STRIP  300
#define BATCH_LENGTH          30
#define LAST_BATCH_IDX        (NUM_PIXELS_PER_STRIP/BATCH_LENGTH)-1

Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NUM_PIXELS_PER_STRIP, LED_STRIP_PIN, NEO_GRB + NEO_KHZ800);

void setup() {
  Serial.begin(115200);
  pixels.begin();
  turnOffLedStrips();
}

int parseChar(char chVal) {
  int val = constrain(chVal, 33, 96)-33; // 0-63 values encoded ASCII from "!" to "`"
  val = constrain((val+1) << 2, 0, 255);
  if (val == 4) {
    val = 0;
  }
  return val;
}

void turnOffLedStrips() {
  for (int i=0; i<NUM_PIXELS_PER_STRIP; i+=1) {
    pixels.setPixelColor(i, pixels.Color(0, 0, 0));
  }
  pixels.show();
  Serial.println("OK Reset");
}

String str;

void driveLedStrip() {
  // pos 1: batch idx (starting from "A", ASCII 65)
  // following triples of RGB values
  int batchIdx = constrain((char)(str.charAt(1)) - 65, 0, LAST_BATCH_IDX);
  int numTriplesInCommand = (str.length()-2) / 3;
  int numLEDsToSet = min(numTriplesInCommand, BATCH_LENGTH);
  int bufIdx = 2;
  int r, g, b;
  for (int i=0; i<numLEDsToSet; i+=1) {
    r = parseChar(str.charAt(bufIdx++));
    g = parseChar(str.charAt(bufIdx++));
    b = parseChar(str.charAt(bufIdx++));
    // Odd rows are indexed backwards because they're chained in zig-zag
    int pixelIdx = (batchIdx % 2 == 0) ? i : (BATCH_LENGTH-1-i);
    pixels.setPixelColor(pixelIdx + batchIdx*BATCH_LENGTH, pixels.Color(r, g, b));
  }
  Serial.print("OK set ");
  Serial.print(numLEDsToSet);
  Serial.print(" LEDs in batch ");
  Serial.println(batchIdx);
}

void showPixels() {
  pixels.show();
  Serial.println("OK Show");
}


void loop() {
  char command;
  while (Serial.available() > 0) {
    str = Serial.readStringUntil('\n');
    // pos 0: command
    command = str.charAt(0);

    if (command == 'A') {
      driveLedStrip();
    } else if (command == 'B') {
      showPixels();
    } else if (command == '0') {
      turnOffLedStrips();
    } else {
      Serial.print("ERROR Unknown command: ");
      Serial.println(command);
    }
  }
}








