/**
 * Created by ssanchez on 29/07/16.
 */
var map,
    me,
    status,
    fixed = false,
    api = '/pokedex',
    pulling = false,
    melocation = {},
    pokedex = window.pokedex;

function initMap () {
    var $element = $("[name='switcher']"),
        $fixed = $("[name='switcher-fixed']");

    $fixed.bootstrapSwitch();
    $element.bootstrapSwitch();

    $fixed.on('switchChange.bootstrapSwitch', function(event, state) {
        fixed = state;
    });

    $element.on('switchChange.bootstrapSwitch', function(event, state) {
        status = state;

        if (state) {
            scanPokemons();
        }
    });

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 1
    });

    google.maps.Marker.prototype.liveOnMap = function (time, reference) {
        if (window.pokedebug) {
            console.log('::::::::::::::::::: POKEMARKER :::::::::::::::::::');
            console.log(time);
            console.log(reference);
        }

        setTimeout(function () {
            reference.setMap(null);
            delete this;
        }, time)
    };
}

function scanPokemons () {
    var navigatorGeoLocation = navigator.geolocation,
        $user = $('#user'),
        $pass = $('#pass'),
        $provider = $('#provider');

    navigatorGeoLocation.getCurrentPosition(function (points) {
        melocation = points;
        setMeInMap(points);

        if (
            $user.val()
            && $pass.val()
            && $provider.val()
            && status
        ) {
            pullPokemons(
                $user.val(),
                $pass.val(),
                $provider.val(),
                melocation
            );
        }
    });

    setInterval(function () {
        navigatorGeoLocation.getCurrentPosition(function (points) {
            melocation = points;

            var latLon = new google.maps.LatLng(points.coords.latitude, points.coords.longitude);

            me.setPosition(latLon);

            if (!fixed) {
                map.panTo(me.getPosition());
            }
        });
    }, 5000);

    setInterval(function () {
        if (
            $user.val()
            && $pass.val()
            && $provider.val()
            && status
        ) {
            pullPokemons(
                $user.val(),
                $pass.val(),
                $provider.val(),
                melocation
            );
        }
    }, 120000);
}

function setMeInMap (points) {
    me = new google.maps.Marker({
        position: {
            lat: points.coords.latitude,
            lng: points.coords.longitude
        },
        map: map
    });

    map.setZoom(17);
    map.panTo(me.getPosition());
}

function pullPokemons (user, pass, provider, location) {
    if (!pulling) {
        pulling = true;

        $.post(
            api,
            {
                user: user,
                pass: pass,
                provider: provider,
                type: 'coords',
                name: 'Pedro de texeira 8 Madrid',
                longitude: location.coords.longitude,
                latitude: location.coords.latitude,
                altitude: 10
            }
        )
            .done(function (data) {
                pullingPokemons(data);
                pulling = false;
            });
    }
}

function pullingPokemons (data) {
    if (window.pokedebug) {
        console.log('::::::::::::::::::: DATA :::::::::::::::::::');
        console.log(data);
    }

    if (data.map) {
        $.each(data.map, function (k, v) {
            if (v.TimeTillHiddenMs) {
                var id = v.pokemon.PokemonId,
                    namecache = [
                        v.Latitude,
                        v.Longitude,
                        id
                    ].join('_');

                if (!$.jStorage.get(namecache)) {
                    $.jStorage.set(namecache, JSON.stringify(v));
                    $.jStorage.setTTL(namecache, v.TimeTillHiddenMs);

                    window[namecache] = new google.maps.Marker({
                        position: {
                            lat: v.Latitude,
                            lng: v.Longitude
                        },
                        map: map,
                        icon: pokedex[id].img,
                        title: pokedex[id].name
                    });

                    window[namecache].liveOnMap(v.TimeTillHiddenMs, window[namecache]);
                }
            }
        });
    }
}

var $showhidecontrols = $('#show-hide-controls');

$showhidecontrols.on('click', function () {
    var $parent = $showhidecontrols.parent();

    if ($parent.hasClass('hiden-own')) {
        $parent.removeClass('hiden-own');
    }

    else {
        $parent.addClass('hiden-own');
    }
});