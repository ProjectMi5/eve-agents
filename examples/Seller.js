"use strict";

var Promise = require('bluebird');
var program = require('commander');
var GeneralAgent = require('./../agents/GeneralAgent');

const EventEmitter = require('events');
const util = require('util');
function MyEmitter() {
  EventEmitter.call(this);
}
util.inherits(MyEmitter, EventEmitter);
var EE = new MyEmitter();

program
  .version('0.0.2')
  .option('-a, --agent-name <name>', 'Agent name: e.g. Seller', /^(\w*)$/i, 'Seller1')
  .option('-d, --directory-facilitator <df>', 'Agent name of the Directory Facilitator', /^(\w*)$/i, 'DF')
  .parse(process.argv);

var agentOptions = {
  id: program.agentName,
  DF: program.directoryFacilitator,
  transports: [
    {
      type: 'amqp',
      //url: 'amqp://localhost'
      host: 'dev.rabbitmq.com'
    }
  ]
};

var Agent = new GeneralAgent(agentOptions);

// ========================================================================================================
// Do not change below ====================================================================================
Promise.all([Agent.ready]).then(function () {
  // Tell how to take Down
  process.on('SIGINT', takeDown);
  process.on('uncaughtException', takeDown);
  // Register Skills
  return Agent.register();
}).catch(function(err){console.log('exe',err)});

function takeDown(){
  // extra function is needed for closure on event
  Agent.takeDown();
}

