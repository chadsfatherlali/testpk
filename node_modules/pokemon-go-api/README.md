# pokemon-go-api

> The unofficial Pokemon Go API (while it lasts).

### How to Install

`npm install pokemon-go-api --save`

### Supported methods

* `.login(username, password, type)`
  * `username` - the username of the account
  * `password` - the password of the account
  * `type` - a string that's either `google` or `pokemon-club`
* `.location.set('address', address)`
  * `address` - the street address as a string
* `.location.set('coordinates', latitude, longitude)`
  * `latitude` - the latitude float
  * `longitude` - the longitude float
* `.getPlayerEndpoint()`
* `.profile.get()`
* `.inventory.get()`
* `.mapData.getNearby()`
* `.mapData.getByAddress(address)`
  * `address` - the street address as a string
* `.mapData.getByCoordinates(latitude, longitude)`
  * `latitude` - the latitude float
  * `longitude` - the longitude float

### Code Examples

For a working set of code examples, visit the [Examples](https://github.com/carldanley/node-pokemon-go-api/tree/master/examples) section of the repository.

### Thanks

This package is made possible thanks to:

* [https://github.com/tejado/pgoapi](https://github.com/tejado/pgoapi)
* [https://github.com/AeonLucid/POGOProtos](https://github.com/AeonLucid/POGOProtos)
