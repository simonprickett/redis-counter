import tm1637
from time import sleep
from gpiozero import Button
from signal import pause

tm = tm1637.TM1637(clk=23, dio=24)
tm.brightness(0)

button_count = Button(16, hold_time=0.1)
button_reset = Button(11, hold_time=2)

count = 0
tm.number(count)

def reset_count():
    global count
    print("Resetting...")
    count = 0
    tm.number(count)

def incr_count():
    global count
    print("Incrementing...")
    count += 1
    tm.number(count)

button_reset.when_held= reset_count
button_count.when_held = incr_count

pause()