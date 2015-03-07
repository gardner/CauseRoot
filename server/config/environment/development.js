'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/causeroot-dev'
  },
  
  neo4j: 'http://localhost:7474/db/data',

  seedDB: true
};
