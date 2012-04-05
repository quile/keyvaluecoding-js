// convenience methods for key-value coding.  objects that
// implement kv coding get these methods for free but will
// probably have to override them.  They can be used in keypaths.
var KVU = require("./keyvalueutilities");

__keyValueAdditions = {
    __int: function( v ) {
        var self = this;
        return parseInt( v, 10 );
    },

    __length: function( v ) {
        var self = this;
        if ( KVU._p_isArray( v ) ) {
            return v.length;
        }
        return v.length;
    },

    __keys: function(v) {
        var self = this;
        if ( typeof v === "object" ) {
            return KVU._p_keys(v);
        }
        return [];
    },

    __reversed: function(list) {
        return list.reverse();
    },

    __sorted: function(list) {
        return list.sort();
    },

    __truncateStringToLength: function(v, length) {
        // this is a cheesy truncator
        if ( v.length > length ) {
            return v.substr(0, length) + "...";
        }
        return v;
    },

    __commaSeparatedList: function( list ) {
        return list.join( ", " );
    },

    // these are useful for building expressions:

    __or: function(a, b) {
        return (a || b);
    },

    __and: function(a, b) {
        return (a && b);
    },

    __not: function(a) {
        return !a;
    },

    __eq: function(a, b) {
        return (a === b);
    }
};

exports.KeyValueAdditions = {
    eq: __keyValueAdditions.__eq,
    not: __keyValueAdditions.__not,
    and: __keyValueAdditions.__and,
    or: __keyValueAdditions.__or,
    commaSeparatedList: __keyValueAdditions.__commaSeparatedList,
    truncateStringToLength: __keyValueAdditions.__truncateStringToLength,
    sorted: __keyValueAdditions.__sorted,
    reversed: __keyValueAdditions.__reversed,
    keys: __keyValueAdditions.__keys,
    length: __keyValueAdditions.__length,
    int: __keyValueAdditions.__int
};