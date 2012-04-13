var util = require('util');

function ok( condition, message ) {
    if ( condition ) {
        util.log( "OK - " + message );
    } else {
        util.log( "Not OK - " + message );
    }
}

// This installs the complex implementation system wide.
require("../keyvaluecoding").install();

var foo = {

    // regular accessor pair
    bar: function() { return this._bar },
    setBar: function( value) { return this._bar = value; },

    baz: [ "banana", "mango" ],

    quux: {}
};

var bib = {
    foo: foo
};

bib.setValueForKey( "papaya", "foo.baz.2" );
ok( foo.baz.length === 3 && foo.baz[2] === "papaya", "Added new array entry" );

foo.setValueForKey( "meow!", "bar" );
ok( foo.bar() === "meow!", "regular setter used" );

bib.setValueForKey( "woof!", "foo.bar" );
ok( foo.bar() === "woof!", "keypath traversed" );

foo.setValueForKey( "silly!", "exclamation" );
ok( foo.exclamation === "silly!", "directly set attribute" );