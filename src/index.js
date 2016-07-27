/**
 * Created by chadsfather on 27/7/16.
 */

'use strict';

const api = require('pokemon-go-api'),
    _ = require('lodash'),
    express = require('express'),
    app = express(),
    swig = require('swig');


app.set('port', (process.env.PORT || 5000));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);

swig.setDefaults({ cache: false });

app.get('/:provider/:user/:pass/:dir', function (req, res) {
    api.login(req.params.user, req.params.pass, req.params.provider)
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
        });
});

app.listen(app.get('port'), function () {
    console.log('Example app listening on port ' + app.get('port'));
});

