// external dependencies
const _ = require('lodash');

// internal dependencies
const rpcApi = require('../utils/request/rpc');

// constants/variables
const envelope = rpcApi.protos.RequestEnvelope;

exports = module.exports = function(endpoint, latitude, longitude, provider, token) {
  const requests = [
    new envelope.Request(envelope.Request.RequestType.GET_INVENTORY)
  ];

  return rpcApi.wrap(latitude, longitude, provider, token)
    .sendRaw(endpoint, requests)
    .then(function(response) {
      const inventoryPayload = response.returns[0];
      const decoded = rpcApi.protos.InventoryResponse.decode(inventoryPayload);
      return decoded.inventory_delta.inventory_items;
    });
};
