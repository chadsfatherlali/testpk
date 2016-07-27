// internal dependencies
const rpcApi = require('../utils/request/rpc');

// constants/variables
const envelope = rpcApi.protos.RequestEnvelope;

exports = module.exports = function(latitude, longitude, provider, token) {
  const endpoint = 'https://pgorelease.nianticlabs.com/plfe/rpc';
  const requests = [
    new envelope.Request(envelope.Request.RequestType.GET_PLAYER),
    new envelope.Request(envelope.Request.RequestType.GET_HATCHED_EGGS),
    new envelope.Request(envelope.Request.RequestType.GET_INVENTORY),
    new envelope.Request(envelope.Request.RequestType.CHECK_AWARDED_BADGES),
    new envelope.Request(envelope.Request.RequestType.DOWNLOAD_SETTINGS)
  ];

  return rpcApi.wrap(latitude, longitude, provider, token)
    .sendRaw(endpoint, requests)
    .then(function(response) {
      return 'https://' + response.api_url + '/rpc';
    });
};
