"use strict";

const config = require('./../config.js');

const _ = require('lodash');
const babble = require('babble');
const develop = require('debug')('develop');
const Promise = require('bluebird');
const uuid = require('uuid-v4');
let GeneralAgent = require('./../agents/GeneralAgent');

const agentOptions = {
  id: 'Negotiator'+uuid(),
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
Agent.taskList = [];

Promise.all([Agent.ready]).then(function () {
  // Agents abilities
  Agent.serviceAddCAcfpParticipant('negotiate', checkParameters, reserve);
  Agent.register();
  Agent.CArequestParticipant('execute', execute);

  // Abilities Declaration
  function checkParameters (message, context) {
    return new Promise( (resolve, reject) => {
      resolve({propose: {price: 0.1337}});
    }).catch(console.error);
  }

  function reserve(message, context) {
    return new Promise( (resolve, reject) => {
      let task = {taskId: 'negotiateid-'+uuid()};
      Agent.taskList.push(task);
      resolve({inform: task});
    }).catch(console.error);
  }

  function execute(message, context){
    return new Promise((resolve, reject) => {
      resolve({inform: 'this is what you need to do'});
    });
  }

  // deRegister upon exiting
  process.once('SIGINT', function(){
    console.log('taking down...');
    Agent.deRegister();
    setTimeout(process.exit, 500); // wait for deregistering complete
  });
}).catch(function(err){console.log('exe',err)});
