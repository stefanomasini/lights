import serial
ser = serial.Serial('/dev/ttyUSB0', 115200, timeout=1)

NUM_PIXELS = 100

ser.write('probe\n')
import time ; time.sleep(0.1)
for i in xrange(NUM_PIXELS):
    #while True:
        #if ser.read(100) == 'OK':
            #print 'OK'
            #break
    cmd = 'A' + ''.join(('aaa' if j == i else '!!!' for j in xrange(NUM_PIXELS)))
    print cmd
    ser.write(cmd+'\n')
    print cmd
    import time; time.sleep(0.01)
ser.write('C\n')
        
while False:
    line = raw_input()
    print line
    ser.write(line+'\n')
    if line == 'Q':
        break
ser.close()
