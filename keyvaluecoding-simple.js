/* --------------------------------------------------------------------
 * keyvaluecoding-simple.js
 * --------------------------------------------------------------------
 * The MIT License
 *
 * Copyright (c) 2010 kd
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
**/

var util = require("util");
var KVU  = require("./keyvalueutilities.js");

// This is the way it is because it was ported from
// a couple of different places from a couple of
// different languages... it could definitely be cleaned up
// and refactored.

var __keyValueCoding = {
    __valueForKey: function( key ) {
        var self = this;
        key = key.toString();
        var v = self[key];
        if ( typeof v === "function" ) {
            return v.apply( self );
        }
        return v
    },
    __setValueForKey: function( value, key ) {
        var self = this;
        key = key.toString();
        var setter = "set" + KVU._p_ucfirst( key );
        var f = self[setter];
        if ( typeof f === "function" ) {
            return f.apply( self, [ value ] );
        }
        self[key] = value;
    },
    __valueForKeyPath: function( keyPath ) {
        var self = this;
        keyPath = keyPath.toString();
        var bits = keyPath.split(".");
        var co = self.valueForKey( bits.shift() );
        if ( bits.length > 0 ) {
            return co.valueForKeyPath( bits.join(".") );
        }
        return co;
    },
    __setValueForKeyPath: function( value, keyPath ) {
        var self = this;
        keyPath = keyPath.toString();
        var bits = keyPath.split(".");
        var co = self;
        if ( bits.length > 1 ) {
            co = co.valueForKey( bits.shift() );
            return co.setValueForKeyPath( value, bits.join(".") );
        }
        return self.setValueForKey( value, bits[0] );
    }
};

exports.KeyValueCoding = {
    valueForKey:        __keyValueCoding.__valueForKey,
    valueForKeyPath:    __keyValueCoding.__valueForKeyPath,
    setValueForKey:     __keyValueCoding.__setValueForKey,
    setValueForKeyPath: __keyValueCoding.__setValueForKeyPath,
};