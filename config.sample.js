process.env.DEBUG = 'develop,error,production';

var config = {};

config.mqttHost = 'mqtt://localhost';
config.amqpHost = 'amqp://localhost';
config.DF = 'DFUID';

module.exports = config;