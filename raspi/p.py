import spidev

spi = spidev.SpiDev()
spi.open(0, 0)
spi.max_speed_hz = 4000000
spi.mode = 0b11

while True:
    val = int(raw_input())
    #to_send = [val]
    spi.xfer([ord(ch) for ch in 'ciao %d\n' % val])
