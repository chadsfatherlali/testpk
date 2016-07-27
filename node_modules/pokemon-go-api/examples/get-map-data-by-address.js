// internal dependencies
const api = require('pokemon-go-api');

// constants/variables
const username = 'username';
const password = 'password';
const provider = 'google';
const location = 'New York';

// main code
api.login(username, password, provider)
  .then(api.getPlayerEndpoint)
  .then(_.partial(api.mapData.getByAddress, location))
  .then(function(data) {
    console.log('success', data);
  })
  .catch(function(error) {
    console.log('error', error.stack);
  });
