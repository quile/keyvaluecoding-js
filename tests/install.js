var util = require('util');

function ok( condition, message ) {
    if ( condition ) {
        util.log( "OK - " + message );
    } else {
        util.log( "Not OK - " + message );
    }
}

function throws_ok( code, message ) {
    try {
        code.apply();
        return false;
    } catch (e) {
        return true;
    };
}

// To install complex system-wide:
// require("./keyvaluecoding").install();
//
// To install simple system-wide:
// require("./keyvaluecoding").install({ simple: true });
//
// To install complex with additions system-wide:
// require("./keyvaluecoding").install({ additions: true });
//
// To install any of these on any specific object:
// var thing = new Thing();
// require("./keyvaluecoding").install({ simple: true, target: thing });
//
// If you're going to use that style, you can save the return value
// from require() and use it:

// -----------------------------------
// Only install simple KVC on Arrays
// -----------------------------------

var kvc = require("../keyvaluecoding");
kvc.install({ simple: true, target: Array });

var foo = [ "banana", "mango", [ "fish", "paste" ] ];

// Arrays
ok( foo.valueForKey("1") === "mango",  "simple - pulled out by a number in a string" );
ok( foo.valueForKey(1) === "mango",    "simple - pulled out by a number" );
ok( foo.valueForKey("2").valueForKey("0") === "fish", "followed chain of strings" );
ok( foo.valueForKey(2).valueForKey(0), "simple - followed chain of numbers" );
ok( foo.valueForKeyPath("2.0"),        "simple - parsed dot path" );
ok( throws_ok( function () { var t = {}; t.valueForKey("banana") } ), "kvc not installed anywhere else" );


// ------------------------------------
// Only install it on a single object:
// ------------------------------------

var bar = {
    planets: [ "tatooine", "dantooine", "endor" ],
    droids: [ "c3po", "r2d2" ]
};
var baz = {
    sith: [ "darth maul", "darth vader" ],
    jedis: [ "yoda", "obi wan" ]
};

bar = kvc.kvc(bar, { simple: true });
ok( bar.valueForKey("planets")[0] === "tatooine", "simple, installed on single obj" );
ok( bar.valueForKeyPath("droids.1") === "r2d2", "simple, installed on single obj" );
ok( throws_ok( function() { baz.valueForKey("sith") } ), "simple, object with no kvc throws" );


// -------------------------------------
// Install complex with additions on
// a single object
// -------------------------------------

var quux = {
    places: [ "mos eisley", "rebel base" ],
    thingsHanDoubts: [ "hokey religions", "ancient weapons" ]
};

kvc.kvc(quux, { additions: true });

ok( quux.valueForKey("sorted(thingsHanDoubts).@0") === "ancient weapons",
            "Han Solo doesn't have faith in hokey religions or ancient weapons." );
ok( throws_ok( function () { foo.sorted() } ), "Hasn't affected other objects" );
