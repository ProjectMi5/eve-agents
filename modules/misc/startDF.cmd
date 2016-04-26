@ECHO OFF
ECHO This script will start the DF (Rabbit-MQ needed)
START "DF" nodemon --watch ./../../mas/DFInstance.js ./../../mas/DFInstance.js
