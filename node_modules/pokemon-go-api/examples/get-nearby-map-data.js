// internal dependencies
const api = require('pokemon-go-api');

// constants/variables
const username = 'username';
const password = 'password';
const provider = 'google';
const location = 'New York';

// main code
api.login(username, password, provider)
  .then(function() {
    return api.location.set('address', location)
      .then(api.getPlayerEndpoint);
  })
  .then(api.mapData.getNearby)
  .then(function(data) {
    console.log('success', data);
  })
  .catch(function(error) {
    console.log('error', error.stack);
  });
