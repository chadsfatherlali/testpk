/**
 * Created by chadsfather on 27/7/16.
 */

'use strict';

const
    PokemonGO = require('pokemon-go-node-api/poke.io.js'),
    _ = require('lodash'),
    express = require('express'),
    app = express(),
    swig = require('swig'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    timeout = require('connect-timeout'),
    pokedex = JSON.parse(fs.readFileSync(__dirname + '/statics/js/pockedex.json', 'utf8'));

app.use(timeout(300000, {}));
app.use('/statics', express.static(__dirname + '/statics'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || 5000));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);

swig.setDefaults({ cache: false });

app.get('/', function (req, res) {
    var pokemons = {};

    _.map(pokedex.pokemon, function (pokemon) {
        pokemons[pokemon.id] = pokemon;
    });

    res.render('index', {
        pokedex: pokemons
    });
});

app.post('/pokedex', function (req, res) {
    var api = new PokemonGO.Pokeio();

    var typelocation = {
        name: {
            type: 'name',
            name: req.body.name
        },
        coords: {
            type: 'coords',
            coords: {
                longitude: parseFloat(req.body.longitude),
                latitude: parseFloat(req.body.latitude),
                altitude: parseFloat(req.body.altitude)
            }
        }
    };

    api.init(
        req.body.user,
        req.body.pass,
        typelocation[req.body.type],
        req.body.provider,
        function (err) {
            if (err) throw err;

            api.Heartbeat(function (err, data) {
                var groups = {
                    nearby: [],
                    map: [],
                    spawn: []
                };

                var pokemonGroup = _.map(data.cells, function (cell) {
                    if (
                        cell.NearbyPokemon.length > 0
                        || cell.WildPokemon.length > 0
                        || cell.MapPokemon.length > 0
                        || cell.SpawnPoint.length > 0
                    ) {
                        return _.pick(cell, [
                            'NearbyPokemon',
                            'WildPokemon',
                            'MapPokemon',
                            'SpawnPoint'
                        ]);
                    }
                });

                pokemonGroup = _.filter(pokemonGroup, function (o) {
                    return typeof o !== 'undefined';
                });

                _.map(pokemonGroup, function (o) {
                    _.each(o, function (v, k) {
                        switch (k) {
                            case 'NearbyPokemon':
                                _.each(v, function (v, k) {
                                    groups.nearby.push(v);
                                });
                                break;

                            case 'SpawnPoint':
                                _.each(v, function (v, k) {
                                    groups.spawn.push(v);
                                });
                                break;

                            default :
                                _.each(v, function (v, k) {
                                    groups.map.push(v);
                                });
                                break;
                        }
                    });
                });

                res.json({
                    brute: data,
                    groups: groups
                });
            });
        }
    )
});

app.listen(app.get('port'), function () {
    console.log('Example app listening on port ' + app.get('port'));
});


