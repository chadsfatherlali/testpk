// external dependencies
const bPromise = require('bluebird');
const _ = require('lodash');
const GoogleOAuth = require('gpsoauthnode');

// internal dependencies
const httpRequest = require('./utils/request/http');

// constants/variables
const google = new GoogleOAuth();
const pokemonClubLoginUrl = 'https://sso.pokemon.com/sso/login?service=https%3A%2F%2Fsso.pokemon.com%2Fsso%2Foauth2.0%2FcallbackAuthorize';
const pokemonClubOauthUrl = 'https://sso.pokemon.com/sso/oauth2.0/accessToken';
const androidDeviceId = '9774d56d682e549c';
const oauthServiceUrl = 'audience:server:client_id:848232511240-7so421jotr2609rmqakceuu1luuq0ptb.apps.googleusercontent.com';
const androidApp = 'com.nianticlabs.pokemongo';
const clientSignature = '321187995bc7cdc2b5fc91b11a96e2baa8602c62';

// main functions
var fn = {

  google: function(username, password) {
    return new bPromise(function(resolve, reject) {
      google.login(username, password, androidDeviceId, function(error, data) {
        if (error) {
          return reject(error);
        }

        google.oauth(username, data.masterToken, data.androidId, oauthServiceUrl, androidApp, clientSignature, function(err, data) {
          if (error) {
            return reject(error);
          }

          var accessToken = data.Auth;
          resolve(accessToken);
        });
      });
    });
  },

  pokemonClub: function(username, password) {
    return fn.parsePokemonClubLoginInfo()
      .then(_.partialRight(fn.loginToPokemonClub, username, password))
      .then(fn.getPokemonClubOauthToken);
  },

  parsePokemonClubLoginInfo: function() {
    const options = {
      url: pokemonClubLoginUrl,
      headers: {
        'User-Agent': 'niantic'
      }
    };

    return httpRequest.get(options)
      .then(function(data) {
        try {
          data = JSON.parse(data.body);
        } catch (err) {
          return bPromise.reject(new Error('Error parsing body'));
        }

        return data;
      });
  },

  loginToPokemonClub: function(data, username, password) {
    const options = {
      url: pokemonClubLoginUrl,
      form: {
        lt: data.lt || '',
        execution: data.execution || '',
        _eventId: 'submit',
        username: username,
        password: password
      },
      headers: {
        'User-Agent': 'niantic'
      }
    };

    return httpRequest.post(options)
      .then(function(data) {
        var body;

        try {
          body = JSON.parse(data.body);
        } catch (err) {
          return bPromise.reject(new Error('Error parsing body'));
        }

        if (body.errors && body.errors.length) {
          return bPromise.reject(new Error('Error logging in: ' + body.errors[0]));
        }

        return data.response.headers['location'].split('ticket=')[1];
      });
  },

  getPokemonClubOauthToken: function(ticket) {
    const options = {
      url: pokemonClubOauthUrl,
      form: {
        'client_id': 'mobile-app_pokemon-go',
        'redirect_uri': 'https://www.nianticlabs.com/pokemongo/error',
        'client_secret': 'w8ScCUXJQc6kXKw8FiOhd8Fixzht18Dq3PEVkUCP5ZPxtgyWsbTvWHFLm2wNY0JR',
        'grant_type': 'refresh_token',
        'code': ticket
      },
      headers: {
        'User-Agent': 'niantic'
      }
    };

    return httpRequest.post(options)
      .then(function(data) {
        return data.body.split('token=')[1].split('&')[0];
      });
  }

};

exports = module.exports = fn;
