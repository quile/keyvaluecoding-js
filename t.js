var util = require("util");
var kvc = require("./keyvaluecoding-complex.js").KeyValueCoding;
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
delete Array.prototype.valueForKey;
delete Array.prototype.valueForKeyPath;

Object.prototype.valueForKey = kvc.valueForKey;
Object.prototype.valueForKeyPath = kvc.valueForKeyPath;
Object.prototype.setValueForKey = kvc.setValueForKey;
Object.prototype.stringWithEvaluatedKeyPathsInLanguage = kvc.stringWithEvaluatedKeyPathsInLanguage;

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

test_object.setValueForKey("william", "shakespeare");
test_object.bacon = "francis";

ok( test_object.valueForKey("shakespeare") === "william", "setValueForKey() correctly set value" );
ok( test_object.valueForKey("bacon") === "francis", "valueForKey() retrieves value set using setter" );

ok( test_object.valueForKey("_s('donne')") === "DONNE", "valueForKey calls method" );
ok( test_object.valueForKey("_s(donne.john)") === "JONNY", "valueForKey follows dot path and parses arguments" );

debugger;
var s = test_object.stringWithEvaluatedKeyPathsInLanguage( "Hey there, ${shakespeare}, did you see ${_s(donne.john)} today?" );
ok( s === "Hey there, william, did you see JONNY today?", "Interpolation works" );

var d = {};
d.setValueForKey( {}, "shelley" );
d.valueForKey( "shelley" ).setValueForKey( "percy", "bysshe" );
ok( d.valueForKey( "shelley.bysshe" ) === "percy", "Plain dictionary responds to valueForKey methods" );


var a = [];
a[0] = { 'wordsworth': 'william', 'keats': ['phil', 'bruce', 'andy', 'john'] };
a[1] = ["samuel", "pepys", [ 1633, 1703 ]];

ok( a.valueForKey("@0.wordsworth") === "william", "@0.wordsworth" );
ok( a.valueForKey("@0.keats.@3") === "john", "@0.keats.@3" );
ok( a.valueForKey("@1.@2.@0") === 1633, "@1.@2.@0" );
ok( a.valueForKey("@0.keats.#") === 4, "@0.keats.#" );
ok( a.valueForKey("@1.@2.#") === 2, "@1.@2.#" );



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
Object.prototype.setValueForKey = kvcs.setValueForKey;

ok( test_object.valueForKey("marlowe") === "christopher", "transparently invoke method" );
ok( test_object.valueForKeyPath("donne.bruce") === "brucey", "followed dot-path across invocation" );

test_object.setValueForKey("will", "shakespeare");
ok( test_object.valueForKey("shakespeare") === "will", "set value for key [simple]" );
