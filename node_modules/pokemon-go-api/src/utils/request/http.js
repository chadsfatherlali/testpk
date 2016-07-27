// external dependencies
const bPromise = require('bluebird');
const Request = require('request');
const _ = require('lodash');

// constants/variables
var fn = {};

fn.cookieJar = Request.jar();

fn.httpRequest = Request.defaults({
  jar: fn.cookieJar
});

fn.post = function(options, callback) {
  return new bPromise(function(resolve, reject) {
    fn.httpRequest.post(options, function(error, response, body) {
      if (error) {
        return reject(error);
      }

      resolve({
        body: body,
        response: response
      });
    });
  });
};

fn.get = function(options, callback) {
  return new bPromise(function(resolve, reject) {
    fn.httpRequest.get(options, function(error, response, body) {
      if (error) {
        return reject(error);
      }

      resolve({
        body: body,
        response: response
      });
    });
  });
};

// expose the request utilities
exports = module.exports = fn;
