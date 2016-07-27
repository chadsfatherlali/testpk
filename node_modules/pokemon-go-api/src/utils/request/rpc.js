// external dependencies
const bPromise = require('bluebird');
const _ = require('lodash');
const protobuf = require('protobufjs');

// internal dependencies
const protos = require('./protos');
const httpRequest = require('./http');

// main functions
var fn = {

  protos: protos,

  wrap: function(latitude, longitude, provider, token) {

    return {

      sendRaw: function(endpoint, requests) {
        const envelop = new protos.RequestEnvelope({
          status_code: 2,
          request_id: 1469378659230941192,
          requests: requests,
          latitude: latitude,
          longitude: longitude,
          altitude: 0,
          auth_info: new protos.RequestEnvelope.AuthInfo({
            provider: provider,
            token: new protos.RequestEnvelope.AuthInfo.JWT(token, 59)
          }),
          unknown12: 989
        });
        const buffer = envelop.encode().toBuffer();
        const options = {
          url: endpoint,
          body: buffer,
          encoding: null,
          headers: {
            'User-Agent': 'Niantic App'
          }
        };

        return httpRequest.post(options)
          .then(function(data) {
            var responseBuffer;

            if (!data.response || !data.body) {
              return bPromise.reject(new Error('RPC Server offline'));
            }

            try {
              responseBuffer = protos.ResponseEnvelope.decode(data.body);
            } catch (error) {
              if (error.decoded) {
                responseBuffer = error.decoded;
              }
            }

            if (!responseBuffer) {
              return fn.wrap(latitude, longitude, provider, token)
                .sendRaw(endpoint, requests);
            }

            return responseBuffer;
          });
      }

    };

  }

};

exports = module.exports = fn;
