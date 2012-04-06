/* --------------------------------------------------------------------
 * keyvaluecoding/additions.js
 * --------------------------------------------------------------------
 * The MIT License
 *
 * Copyright (c) 2012 kd
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// convenience methods for key-value coding.  objects that
// implement kv coding get these methods for free but will
// probably have to override them.  They can be used in keypaths.


var KVU = require("./utilities");

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