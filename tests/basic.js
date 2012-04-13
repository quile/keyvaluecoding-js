var util = require("util");
var kvc  = require("../keyvaluecoding/complex").KeyValueCoding;
var kvcs = require("../keyvaluecoding/simple").KeyValueCoding;

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
ok( test_object.valueForKey("chaucer('geoffrey')") === "canterbury", "valueForKey passes arguments" );

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

// test additions

var kva  = require("../keyvaluecoding/additions").KeyValueAdditions;
// force the new additions into the prototype
for (var key in kva) {
    Object.prototype[key] = kva[key];
}

var o = {
    eq1: "beggar's canyon",
    eq2: "beggar's canyon",
    eq3: "wamp rats",

    or1: true,
    or2: false,
    or3: false,

    and1: true,
    and2: true,
    and3: false,

    not1: true,
    not2: false,

    commas: [ "twelve", "parsecs", "kessel", "run" ],
    truncate1: "A long time ago in a galaxy far, far away",
    sort1: [ "luke", "leia", "yoda", "obi wan" ],
    reverse1: [ "ewok", "wookiee", "lando" ],
    keys1: {
        han: "solo",
        leia: "organa",
        luke: "skywalker"
    },
    length1: [ "c3po", "r2d2" ],
    int1: "12"
};

ok( o.valueForKey("eq(eq1, eq2)") === true, "eq" );
ok( o.valueForKey("eq(eq2, eq3)") === false, "eq" );
ok( o.valueForKey("or(or1, or2)") === true, "or" );
ok( o.valueForKey("or(or2, or3)") === false, "or" );
ok( o.valueForKey("or(or1, or3)") === true, "or" );
ok( o.valueForKey("and(and1, and2)") === true, "and" );
ok( o.valueForKey("and(and2, and3)") === false, "and" );
ok( o.valueForKey("and(and1, and3)") === false, "and" );
ok( o.valueForKey("not(not1)") === false, "not" );
ok( o.valueForKey("not(not2)") === true, "not" );
ok( o.valueForKey("commaSeparatedList(commas)") === "twelve, parsecs, kessel, run", "commas" );
ok( o.valueForKey("truncateStringToLength(truncate1, 10)") === "A long tim...", "truncate" );
ok( o.valueForKey("commaSeparatedList(sorted(sort1))") === "leia, luke, obi wan, yoda", "sorted" );
ok( o.valueForKey("commaSeparatedList(reversed(reverse1))") === "lando, wookiee, ewok", "reversed" );
ok( o.valueForKey("commaSeparatedList(sorted(keys(keys1)))") === "han, leia, luke", "keys" );
ok( o.valueForKey("length(length1)") === 2, "length" );
ok( o.valueForKey("int(int1)") === 12, "int" );


// test simple interface

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