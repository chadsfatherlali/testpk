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
    }, 30000);
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
                name: 'Sol Madrid',
                longitude: location.coords.longitude,
                latitude: location.coords.latitude,
                altitude: 20
            }
        )
            .done(function (data) {
                if (window.pokedebug) {
                    console.log('::::::::::::::::::: BRUTE :::::::::::::::::::');
                    console.log(data);
                }

                setSpawnpoint(data.groups.spawn);
                pullingPokemons(data.groups);
                pulling = false;
            });
    }
}

function setSpawnpoint(data) {
    if (window.pokedebug) {
        console.log('::::::::::::::::::: POINT :::::::::::::::::::');
        console.log(data);
    }

    $.each(data, function (k ,v) {
        var printid = ['print', v.Latitude, v.Longitude].join('_');

        window[printid] = new google.maps.Marker({
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 0.2,
                fillOpacity: 0.3,
                fillColor: 'red',
                path: 'M121.731,21.763c-6.002,3.375-13.75,19.623-17,18.123c-3.25-1.5-5-29.622-7.873-32.267    c-4.874,4.642-5.501,30.642-9.624,32.267c-4.126,1.625-12.125-16.874-15.5-17.25C69.86,30.388,84.859,78.388,95.86,78.388    S122.98,29.014,121.731,21.763z'
            },
            position: {
                lat: v.Latitude,
                lng: v.Longitude
            },
            map: map
        });

        window[printid].liveOnMap(30000, window[printid]);
    });
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

                /*if (!$.jStorage.get(namecache)) {
                    $.jStorage.set(namecache, JSON.stringify(v));
                    $.jStorage.setTTL(namecache, v.TimeTillHiddenMs);*/

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
                /*}*/
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