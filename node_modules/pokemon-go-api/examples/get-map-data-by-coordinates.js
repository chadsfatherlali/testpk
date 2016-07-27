// internal dependencies
const api = require('pokemon-go-api');

// constants/variables
const username = 'username';
const password = 'password';
const provider = 'google';

// main code
api.login(username, password, provider)
  .then(api.getPlayerEndpoint)
  .then(_.partial(api.mapData.getByCoordinates, 40.707914, -74.005845))
  .then(function(data) {
    console.log('success', data);
  })
  .catch(function(error) {
    console.log('error', error.stack);
  });
