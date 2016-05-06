"use strict";

const config = require('./../config.js');

const develop = require('debug')('develop');
const error = require('debug')('error');
const production = require('debug')('production');

const _ = require('lodash');
const co = require('co');
const babble = require('babble');
const Promise = require('bluebird');
const uuid = require('uuid-v4');
const GeneralAgent = require('./../agents/GeneralAgent');

const agentOptions = {
  id: 'Order'+uuid(),
  DF: config.DF,
  transports: [
    {
      type: 'amqp',
      url: config.amqpHost
    }
  ],
  mqtt: config.mqttHost
};
let Agent = new GeneralAgent(agentOptions);

const recipe = [
  {
    service: 'cup-input',
    parameters: {type: 'mi5-cup'}
  },
  {
    service: 'fill',
    parameters: {liquid: 'orange', amount: 100}
  },
  {
    service: 'cup-output',
    parameters: {type: 'mi5-cup'}
  }
];

Promise.all([Agent.ready]).then(function () {
  // Agents abilities
  Agent.serviceAdd('process-orders', '');
  Agent.register();

  co(function* (){
    let selectedNegotiator = yield Agent.searchAndSelectServiceBy('negotiate', recipe, 'price');
    let result = yield Agent.CArequest(selectedNegotiator.agent, 'execute', selectedNegotiator.taskId);
    console.log(result);
  });


  // deRegister upon exiting
  process.once('SIGINT', function(){
    console.log('taking down...');
    Agent.deRegister();
    setTimeout(process.exit, 500); // wait for deregistering complete
  });
}).catch(function(err){console.log('exe',err)});
