Multi-Agent and Service Oriented example for a co-based control flow
====================================================================

This project is implementing the book-trading example, so often cited
in agent-based programming. It is adapted to give a comparison for the
JADE-Agent Framework.

The implementation of the agent is using ES6 to benefit from a nice, 
generator-based control flow using promises.

Usage
------

* Start a local RabbitMQ Broker (if using another than localhost, you need to adapt the agent instances)
* Start Directory Facilitator: `node DFInstance.js`
* Start some Seller Agents: `node examples/SellerPromisesBabble.js`
* Start a Buyer Agent: `node examples/BuyerPromisesBabble.js`