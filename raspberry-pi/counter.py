import os
import tm1637
import redis
from time import sleep
from gpiozero import Button
from signal import pause
from dotenv import load_dotenv

load_dotenv()

redis_client = redis.Redis.from_url(os.getenv("REDIS_URL"))
pubsub_client = redis_client.pubsub(ignore_subscribe_messages=True)

tm = tm1637.TM1637(clk=23, dio=24)
tm.brightness(0)

button_count = Button(16, hold_time=0.1)
button_reset = Button(11, hold_time=2)

COUNTER_KEY_NAME = "mycounter"
REDIS_PUB_SUB_CHANNEL_NAME = f"__keyspace@0__:{COUNTER_KEY_NAME}"

def reset_count():
    print("Resetting...")
    redis_client.delete(COUNTER_KEY_NAME)

def incr_count():
    print("Incrementing...")
    redis_client.incrby(COUNTER_KEY_NAME, amount=1)

button_reset.when_held = reset_count
button_count.when_held = incr_count

count = redis_client.get(COUNTER_KEY_NAME)

if count is None:
    count = 0

print(f"Initial count value is {count}")
tm.number(int(count))

pubsub_client.subscribe(REDIS_PUB_SUB_CHANNEL_NAME)

for message in pubsub_client.listen():
    new_count = 0

    if message["data"] == "incrby":
        new_count = int(redis_client.get(COUNTER_KEY_NAME))
        print(f"Count is {new_count}.")
    elif message["data"] == "del":
        print("Count reset to 0.")

    tm.number(new_count)
        
