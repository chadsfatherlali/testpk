// external dependencies
const _ = require('lodash');

// internal dependencies
const rpcApi = require('../utils/request/rpc');
const getNeighboringCellIds = require('../utils/get-neighboring-cell-ids');

// constants/variables
const envelope = rpcApi.protos.RequestEnvelope;

exports = module.exports = function(endpoint, latitude, longitude, provider, token) {
  const mapObjectMessage = new rpcApi.protos.MapObjectsRequest({
    cell_ids: getNeighboringCellIds(latitude, longitude),
    since_timestamp_ms: [],
    latitude: latitude,
    longitude: longitude
  });
  const requests = [
    new envelope.Request(envelope.Request.RequestType.GET_MAP_OBJECTS,
      mapObjectMessage.encode().toBuffer())
  ];

  return rpcApi.wrap(latitude, longitude, provider, token)
    .sendRaw(endpoint, requests)
    .then(function(response) {
      const mapObjectsPayload = response.returns[0];
      const mapCells = rpcApi.protos.MapObjectsResponse
        .decode(mapObjectsPayload).map_cells;

      return mapCells;
    });
};
