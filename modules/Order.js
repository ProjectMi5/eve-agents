"use strict";

const config = require('./../config.js');

const develop = require('debug')('develop');
const error = require('debug')('error');
const production = require('debug')('production');

const _ = require('lodash');
const babble = require('babble');
const Promise = require('bluebird');
const uuid = require('uuid-v4');
let GeneralAgent = require('./../agents/GeneralAgent');

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

  Agent.searchAndSelectServiceBy = function(service, objective, criteria) {
    return Agent.searchService(service)
      .then((agents)=>{
        return Promise.all(agents.map(function(agent){
          return Agent.CAcfp(agent.agent, service, objective);
        }));
      })
      .then((propositions)=>{
        return Promise.resolve( _.minBy(propositions, criteria));
      })
      .then((selectedProposition)=>{
        develop(selectedProposition);
        return Agent.CAcfpAcceptProposal(selectedProposition.agent, service, objective);
      })
      .then((reply)=>{
        if(reply.inform) {
          return Promise.resolve(reply.inform.taskId);
        } else {
          throw new Error('failure in reservation', reply);
        }
      })
      .catch(error);
  };
  Agent.searchAndSelectServiceBy('negotiate', recipe, 'price')
    .then(develop);


  // deRegister upon exiting
  process.once('SIGINT', function(){
    console.log('taking down...');
    Agent.deRegister();
    setTimeout(process.exit, 500); // wait for deregistering complete
  });
}).catch(function(err){console.log('exe',err)});