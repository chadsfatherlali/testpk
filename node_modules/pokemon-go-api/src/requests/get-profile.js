// internal dependencies
const rpcApi = require('../utils/request/rpc');

// constants/variables
const envelope = rpcApi.protos.RequestEnvelope;

exports = module.exports = function(endpoint, latitude, longitude, provider, token) {
  const requests = [
    new envelope.Request(envelope.Request.RequestType.GET_PLAYER)
  ];

  return rpcApi.wrap(latitude, longitude, provider, token)
    .sendRaw(endpoint, requests)
    .then(function(response) {
      const profilePayload = response.returns[0];
      return rpcApi.protos.ProfileResponse.decode(profilePayload).profile;
    });
};
