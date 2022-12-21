# Redis Counter Project

Counting with Redis, a Raspberry Pi with TM1637 7 segment display and a web interface.  Code in Python and Node.js.  

![Screenshot of the completed project](redis_counter_pi_project.png)

The aim of this project is to demonstrate how the current value of the count, stored in Redis, can be displayed and updated simultaneously from multiple displays.  I demonstrate using multiple instances of a web interface, plus the 7 segment display and an arcade button attached to a Raspberry Pi.

This project was created as part of my [Things on Thursdays](https://simonprickett.dev/things-on-thursdays-livestreams/) IoT livestreaming series for Redis.  Check out the videos for this project below:

* [Quick Preview of the project working](https://www.youtube.com/watch?v=zUvBzoQJiPQ)
* [Episode 1](https://www.youtube.com/watch?v=NJyR8FKb9aI&t=8s)
* [Episode 2](https://www.youtube.com/watch?v=Ad7zHs5ViWw&t=22s)

## Shopping List

TODO

## Raspberry Pi / 7 Segment Display / Arcade Button Setup

TODO

## Redis Setup

The fastest way to get started is to create yourself [a Redis database in the cloud](https://redis.com/try-free/).  Once you've signed up and created a database, make a note of the host, port, and password... you'll need these later.

Use the free tier, you don't need to add a payment method.

## Optional: RedisInsight

This is optional, and free, but worth using if you want to see what's happening in your Redis database:

[Download a copy of RedisInsight](https://redis.com/redis-enterprise/redis-insight/) - once you've installed RedisInsight use the host, port and password for your Redis database to connect.

## Software Setup

### For the Web Interface

Follow the instructions in the [`web/README.md`](web/README.md) file.

### For the Raspberry Pi

Follow the instructions in the [`raspberry-pi/README.md`](raspberry-pi/README.md) file.


