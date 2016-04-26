"use strict";

const config = require('./../config.js');

const _ = require('lodash');
const develop = require('debug')('develop');
const Promise = require('bluebird');
const uuid = require('uuid-v4');
const co = require('co');
let GeneralAgent = require('./../agents/GeneralAgent');

const agentOptions = {
  id: 'Cocktail'+uuid(),
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

Agent.position = 500;
Agent.liquids = [
  {type: 'grenadine', amount: '10000'},
  {type: 'lemon', amount: '10000'},
  {type: 'maracuja', amount: '10000'},
  {type: 'pineapple', amount: '10000'},
  {type: 'orange', amount: '10000'},
  {type: 'strawberry', amount: '10000'},
  {type: 'bluecuracao', amount: '10000'},
  {type: 'water', amount: '10000'}
];
Agent.taskList = [];

Agent.execute = function(){
  return new Promise( (resolve, reject) => {
      console.log('execute.......');
      console.log(Agent.timer.getTime());
      Agent.timer.setTimeout(resolve, 0);
  });
};

Promise.all([Agent.ready]).then(function () {
  Agent.events.on('registered',console.log);

  Agent.serviceAddCAcfpParticipant('cfp-fill', checkParameters, reserve);

  function checkParameters (message, context) {
    return new Promise( (resolve, reject) => {
      develop('#checkParams', message, context);
      let offer = {price: 0.1};
      develop('offer:', offer);
      resolve({propose: offer });
    }).catch(console.error);
  }

  function reserve(message, context) {
    return new Promise( (resolve, reject) => {
      develop('#reserve', message, context);

      let task = {taskId: 'fill-'+uuid()};
      Agent.taskList.push(task);
      develop('inform-result:', task);
      resolve({inform: task});
    }).catch(console.error);
  }

  Agent.CArequestParticipant('request-give', give);
  function give(message, context){
    develop('#give', message, context);
    return new Promise((resolve, reject) => {
      resolve({inform: 'here you have it'});
    });
  }

  Agent.CArequestParticipant('request-take', take);
  function take(message, context){
    develop('#take', message, context);
    return new Promise((resolve, reject) => {
      resolve({inform: 'i took it'});
    });
  }

  Agent.CArequestParticipant('request-execute', execute);
  function execute (objective, context) {
    develop('#execute', objective, context);

    return new Promise((resolve, reject) => {
      co(function* () {
        let job = _.find(Agent.taskList, {taskId: objective.taskId});
        console.log('task', job);
        yield Agent.execute();
        _.remove(Agent.taskList, {taskId: job.taskId});
        develop('task successfully finished. removed. taskList:', Agent.taskList);
        resolve({inform: 'done'});
      }).catch(console.error);
    });
  }

  // Register Services
  Agent.register()
    .catch(console.log);

  // deRegister upon exiting
  process.on('SIGINT', function(){
    console.log('taking down...');
    Agent.deRegister();
    setTimeout(process.exit, 500); // wait for deregistering complete
  });

  // nodemon-event: rs (restart)
  process.once('SIGUSR2', function () {
    Agent.deRegister();
    setTimeout(function () {
      process.kill(process.pid, 'SIGUSR2');
    },500);
  });

}).catch(function(err){console.log('exe',err)});
