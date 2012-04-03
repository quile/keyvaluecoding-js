var util = require("util");
var kvc = require("./keyvaluecoding.js").KeyValueCoding;
var kvcs = require("./keyvaluecoding-simple.js").KeyValueCoding;

function ok( condition, message ) {
    if ( condition ) {
        util.log( "OK - " + message );
    } else {
        util.log( "Not OK - " + message );
    }
}

// TODO:kd - auto-extend Array
Array.prototype.valueForKey = kvc.valueForKey;
Array.prototype.valueForKeyPath = kvc.valueForKeyPath;

var foo = [ "banana", "mango", [ "fish", "paste" ] ];

// Arrays
ok( foo.valueForKey("1") === "mango", "pulled out by a number in a string" );
ok( foo.valueForKey(1) === "mango", "pulled out by a number" );
ok( foo.valueForKey("2").valueForKey("0") === "fish", "followed chain of strings" );
ok( foo.valueForKey(2).valueForKey(0), "followed chain of numbers" );
ok( foo.valueForKey("2.0"), "parsed dot path" );

// Dictionaries & Objects
Object.prototype.valueForKey = kvc.valueForKey;
Object.prototype.valueForKeyPath = kvc.valueForKeyPath;

var test_object = {
    bacon: null,

    shakespeare: function() {
        return this._shakespeare;
    },

    setShakespeare: function( value ) {
        return this._shakespeare = value;
    },

    marlowe: function() {
        return "christopher";
    },

    chaucer: function( value ) {
        if (value == "geoffrey") { return "canterbury" }
        return "tales";
    },

    _s: function( value ) {
        return value.toUpperCase();
    },

    donne: function() {
        return {
            "john": "jonny",
            "bruce": "brucey"
        };
    }
};

ok( test_object.valueForKey("marlowe") === "christopher", "transparently invoke method" );
ok( test_object.valueForKey("donne.bruce") === "brucey", "followed dot-path across invocation" );



// simple

// TODO:kd - auto-extend Array
Array.prototype.valueForKey = kvcs.valueForKey;
Array.prototype.valueForKeyPath = kvcs.valueForKeyPath;

var foo = [ "banana", "mango", [ "fish", "paste" ] ];

// Arrays
ok( foo.valueForKey("1") === "mango", "pulled out by a number in a string" );
ok( foo.valueForKey(1) === "mango", "pulled out by a number" );
ok( foo.valueForKey("2").valueForKey("0") === "fish", "followed chain of strings" );
ok( foo.valueForKey(2).valueForKey(0), "followed chain of numbers" );
ok( foo.valueForKeyPath("2.0"), "parsed dot path" );


// Dictionaries & Objects
Object.prototype.valueForKey = kvcs.valueForKey;
Object.prototype.valueForKeyPath = kvcs.valueForKeyPath;
ok( test_object.valueForKey("marlowe") === "christopher", "transparently invoke method" );
ok( test_object.valueForKeyPath("donne.bruce") === "brucey", "followed dot-path across invocation" );


