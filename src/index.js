/**
 * Created by chadsfather on 27/7/16.
 */

'use strict';

const
    PokemonGO = require('pokemon-go-node-api/poke.io.js'),
    api = require('pokemon-go-api'),
    _ = require('lodash'),
    express = require('express'),
    app = express(),
    swig = require('swig'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    pokedex = JSON.parse(fs.readFileSync(__dirname + '/js/pockedex.json', 'utf8'));

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

    /*api.login(req.params.user, req.params.pass, req.params.provider)
        .then(function() {
            return api.location.set('address', req.params.dir)
                .then(api.getPlayerEndpoint);
        })
        .then(api.mapData.getNearby)
        .then(function(data) {
            var results = _.map(data, function (result) {
                if (result.catchable_pokemon.length > 0
                    || result.wild_pokemon.length > 0
                ) {
                    return _.pick(result, [
                        'wild_pokemon',
                        'catchable_pokemon',
                        'nearby_pokemon'
                    ]);
                }
            });

            var pokemons = _.filter(results, function (result) {
                return typeof result !== 'undefined';
            });

            res.render('index', {
                pokemons: pokemons,
                dir: req.params.dir
            });
        })
        .catch(function(error) {
            console.log('error', error.stack);
        });*/

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
        'coords': {
            type: 'coords',
            'coords': {
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
                    'nearby': [],
                    'map': []
                };

                var pokemonGroup = _.map(data.cells, function (cell) {
                    if (
                        cell.NearbyPokemon.length > 0
                        || cell.WildPokemon.length > 0
                        || cell.MapPokemon.length > 0
                    ) {
                        return _.pick(cell, [
                            'NearbyPokemon',
                            'WildPokemon',
                            'MapPokemon'
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

                            default :
                                _.each(v, function (v, k) {
                                    groups.map.push(v);
                                });
                                break;
                        }
                    });
                });

                res.json(groups);
            });
        }
    )
});

app.listen(app.get('port'), function () {
    console.log('Example app listening on port ' + app.get('port'));
});

