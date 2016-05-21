// Based on work by Nick Gammon: http://www.gammon.com.au/spi

#include <SPI.h>
#include <Adafruit_NeoPixel.h>

#define DEBUG      1

#define LED_PIN                 3
#define LED_STRIP_1_PIN         5
#define LED_STRIP_2_PIN         6

#define NUM_PIXELS_PER_STRIP  150

// 1 byte for the command, the rest for RGB values
#define BUFFER_LENGTH     1 + NUM_PIXELS_PER_STRIP*2*3


Adafruit_NeoPixel pixelsA = Adafruit_NeoPixel(NUM_PIXELS_PER_STRIP, LED_STRIP_1_PIN, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel pixelsB = Adafruit_NeoPixel(NUM_PIXELS_PER_STRIP, LED_STRIP_2_PIN, NEO_GRB + NEO_KHZ800);

#define BUFFER_READY_TO_WRITE    1  // (i.e. to be used by interrupt handler)
#define BUFFER_READY_TO_PROCESS  2  // (i.e. to be used by main loop)

byte buf[BUFFER_LENGTH];
union {
  byte as_bytes[2]; // Least-significant byte first (LSB)
  unsigned int as_int; // To be used by producer (i.e. interrupt handler)
} payload_size_buf;
unsigned int payload_size;      // To be used by consumer (i.e. main loop)
volatile unsigned int buffer_pos;
volatile boolean writing_buffer;
volatile unsigned int data_yet_to_receive;
volatile byte buffer_state;


void setup (void) {
#ifdef DEBUG
  Serial.begin(115200);   // debugging
#endif

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // have to send on master in, *slave out*
//  pinMode(MISO, OUTPUT);

  pinMode(SCK, INPUT);
  pinMode(MOSI, INPUT);
  pinMode(MISO, OUTPUT);

  // turn on SPI in slave mode
  SPCR |= _BV(SPE);

  // get ready for an interrupt
  buffer_pos = 0;
  buffer_state = BUFFER_READY_TO_WRITE;

  // Initialize buffer
  for (int i=0; i<NUM_PIXELS_PER_STRIP*2*3; i++) {
    buf[i] = 0;
  }

  pixelsA.begin();
  pixelsB.begin();

  // now turn on interrupts
  SPI.attachInterrupt();

#ifdef DEBUG
  Serial.println("ready");  
#endif
}  // end of setup


// SPI interrupt routine
ISR (SPI_STC_vect) {
  byte c = SPDR;  // grab byte from SPI Data Register

  // The first two bytes are the command length
  if (buffer_pos <= 1) {
    // Check the status of the buffer when the first byte is received, to determine
    // whether the command will be saved in the buffer or discarded altogether 
    // (i.e. when the consumer is still busy working on the previous buffer)
    if (buffer_pos == 0) {
      writing_buffer = (buffer_state == BUFFER_READY_TO_WRITE);
    }
    payload_size_buf.as_bytes[buffer_pos] = c;
    if (buffer_pos == 1) {
      data_yet_to_receive = payload_size_buf.as_int;
    }
//    size_buf[buffer_pos] = c;
//    writing_buffer = true;
//    data_yet_to_receive = 5;
    
    buffer_pos += 1;
  } else {
    data_yet_to_receive -= 1;
    if (buffer_pos-2 >= sizeof buf) {
      writing_buffer = false;
    }
    if (writing_buffer) {
      buf[buffer_pos-2] = c;
      if (data_yet_to_receive == 0) {
        // Kick off consumer
        // Notice that consumer may use payload_size, while producer is busy receiving new commands thus reusing payload_size_buf
        payload_size = payload_size_buf.as_int;
        buffer_state = BUFFER_READY_TO_PROCESS;
      }
    }
    if (data_yet_to_receive == 0) {
      // Get ready to receive a new command
      buffer_pos = 0;
    } else {
      buffer_pos += 1;
    }
  }

//  // add to buffer if room
//  if (buffer_pos < sizeof buf) {
//    buf[buffer_pos++] = c;
//
//    if (buffer_pos == 2) {
//        data_to_receive = buf[0] << 8 + buf[1];
//        process_it = true;
//    }
//
//    // example: newline means time to process buffer
////    if (c == '\n') {
////      process_it = true;
////    }
//
//  }  // end of room available
}  // end of interrupt routine SPI_STC_vect

// main loop - wait for flag set in interrupt routine
volatile unsigned int last_pos = 1000;
void loop (void) {
  #ifdef DEBUG
  if (buffer_pos != last_pos) {
    Serial.print(buffer_pos);
    Serial.print(" ");
    Serial.print(data_yet_to_receive);
    Serial.print(" ");
    Serial.print(payload_size);
    Serial.print(" ");
    Serial.print(buffer_state);
    Serial.println();
    last_pos = buffer_pos;
  }
  
  #endif
  if (buffer_state == BUFFER_READY_TO_PROCESS) {
    #ifdef DEBUG
        Serial.println("command:");
        Serial.println(payload_size_buf.as_int, DEC);
        Serial.println(buf[0], DEC);
        Serial.println(buf[1], DEC);
        Serial.println(buf[2], DEC);
        Serial.println(buf[3], DEC);
        Serial.println(buf[4], DEC);
        Serial.println(buf[5], DEC);
        Serial.println(buf[6], DEC);
        Serial.println(buf[7], DEC);
        Serial.println(buf[8], DEC);
        Serial.println(buf[9], DEC);
    #endif
    digitalWrite(LED_PIN, HIGH);
    delay(500);
    digitalWrite(LED_PIN, LOW);
    delay(200);
    buffer_state = BUFFER_READY_TO_WRITE;
  }
//  if (process_it) {
////    buf[buffer_pos] = 0;
////    if (buf[0] == '1') {
////      digitalWrite(LED_PIN, HIGH);
////    } else {
////      digitalWrite(LED_PIN, LOW);
////    }
//
//    buffer_pos = 0;
//    process_it = false;
//  }  // end of flag set

}  // end of loop
