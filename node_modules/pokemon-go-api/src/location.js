// external dependencies
const bPromise = require('bluebird');
const _ = require('lodash');
const geocoder = require('geocoder');

// constants/variables
const geocode = bPromise.promisify(geocoder.geocode.bind(geocoder));

// main functions
var fn = {

  address: {

    getByCoordinates: function(latitude, longitude) {
      const promise = bPromise.promisify(_.partial(geocoder.reverseGeocode
        .bind(geocoder), latitude, longitude));

      return promise()
        .then(function(data) {
          if (data.status === 'ZERO_RESULTS') {
            return null;
          }

          return {
            latitude: latitude,
            longitude: longitude,
            value: data.results[0].formatted_address
          };
        });
    }

  },

  coordinates: {

    getByAddress: function(address) {
      return geocode(address)
        .then(function(data) {
          if (data.status === 'ZERO_RESULTS') {
            return null;
          }

          const location = data.results[0].geometry.location;

          return {
            latitude: location.lat,
            longitude: location.lng,
            value: address
          };
        });
    }

  }

};

exports = module.exports = fn;
