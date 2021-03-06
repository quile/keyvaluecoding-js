/* --------------------------------------------------------------------
 * keyvaluecoding/complex.js
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

var KVU = require('./utilities');

var DOT_OR_PARENTHESIS = new RegExp("[\.\(]");

// This is the way it is because it was ported from
// a couple of different places from a couple of
// different languages... it could definitely be cleaned up
// and refactored.

var __keyValueCoding = {
    __setValue_forKey: function(v, key) {
        var self = this;
        if (key.match(/\./)) {
            return __keyValueCoding.__setValue_forKeyPath.apply( self, [ v, key ] );
        }

        var setMethodName = "set" + KVU._p_ucfirst(KVU._p_niceName(key));
        if ( KVU._p_can( self, setMethodName ) ) {
            self[setMethodName].apply(self, [v]);
            return;
        }
        // otherwise:
        self[key] = v;
    },

    __valueForKey: function(key) {
        var self = this;
        key = key.toString();
        if (key.match(DOT_OR_PARENTHESIS)) {
            return __keyValueCoding.__valueForKeyPath.apply( self, [ key ] );
        }

        // generate a get method names:
        var keyList = __keyValueCoding.__listOfPossibleKeyNames( key );

        for (var i=0; i < keyList.length; i++) {
            var testKey = keyList[i];
            var getMethodName = testKey;

            if ( KVU._p_can(self, getMethodName) ) {
                v = self[getMethodName].apply( self );
                return v;
            }
        }
        if (self.hasOwnProperty(key)) {
            return self[key];
        }

        try {
            return self.valueForUndefinedKey( key );
        } catch (e) {
            return null;
        }
    },

    __valueForKeyPathElement_onObject: function( keyPathElement, obj ) {
        var self = this;
        if ( !obj ) {
            return null;
        }
        var key = keyPathElement['key'];
        if ( !keyPathElement['arguments'] ) {
            return __keyValueCoding.__valueForKey_onObject.apply(self, [ key, obj ] );
        }

        if ( typeof obj !== 'object' ) { return null }

        var sel = key;
        for ( var i = 0; i < keyPathElement['argumentValues'].length; i++) {
            sel = sel + ":";
        }
        var f = obj[key];
        if ( typeof f === "function" ) {
            return f.apply( obj, keyPathElement.argumentValues );
        }
        if (key === "valueForKey") {
            return __keyValueCoding.__valueForKey_onObject.apply( self, [ keyPathElement.argumentValues[0], obj ] );
        }
        return __keyValueCoding.__valueForKey_onObject.apply( self, [ key, obj ] );
    },

    __valueForKey_onObject: function( key, obj ) {
        var self = this;
        if ( typeof obj !== "object" ) { return null }
        if ( KVU._p_isArray( obj ) && !key.match(/^\d+$/) ) {
            if ( key == "#" ) {
                return obj.length;
            }
            var match = key.match(new RegExp("^\@([0-9]+)$"));
            if ( match ) {
                var element = match[1];
                return obj[element];
            }
            if ( key.match(new RegExp("^[a-zA-Z0-9_]+$")) ) {
                var values = [];
                for (var i=0; i < obj.length; i++) {
                    var item = obj[i];
                    values.push( __keyValueCoding.__valueForKey_onObject.apply( self, [ key, item ] ) );
                }
                return values;
            }
        }

        return __keyValueCoding.__valueForKey.apply( obj, [ key ] );
    },

    __setValue_forKey_onObject: function(v, key, obj) {
        var self = this;
        if (typeof obj != 'object') { return }
        if ( KVU._p_can( obj, "setValueForKey" ) ) {
            return obj.setValueForKey( v, key );
        }
        if ( !KVU._p_isHash(obj) ) { return }
        obj[key] = v;
    },

    __valueForKeyPath: function( keyPath ) {
        var self = this;
        var bits = __keyValueCoding.__targetObjectAndKeyForKeyPath.apply( self, [ keyPath ] );
        var currentObject = bits[0];
        var targetKeyPathElement = bits[1];

        if (currentObject && targetKeyPathElement) {
            return __keyValueCoding.__valueForKeyPathElement_onObject.apply( self, [ targetKeyPathElement, currentObject ] );
        }
        return null;
    },

    __setValue_forKeyPath: function(v, keyPath) {
        var self = this;
        var bits = __keyValueCoding.__targetObjectAndKeyForKeyPath.apply( self, [ keyPath ] );
        var currentObject = bits[0];
        var targetKeyPathElement = bits[1];

        if (currentObject && targetKeyPathElement) {
            __keyValueCoding.__setValue_forKey_onObject.apply( self, [ v, targetKeyPathElement["key"], currentObject ] );
        }
    },

    // This returns the *second-to-last* object in the keypath
    __targetObjectAndKeyForKeyPath: function( keyPath ) {
        var self = this;
        var keyPathElements = KVU.keyPathElementsForPath( keyPath );

        // first evaluate any args
        for ( var i = 0; i < keyPathElements.length; i++ ) {
            var element = keyPathElements[i];
            if ( !element['arguments'] ) { continue }
            var argumentValues = [];
            for ( var j = 0; j < element['arguments'].length; j++ ) {
                var argument = element['arguments'][j];
                if ( KVU.expressionIsKeyPath( argument ) ) {
                    argumentValues.push( __keyValueCoding.__valueForKey.apply( self, [ argument ] ) );
                } else {
                    argumentValues.push( __keyValueCoding.__evaluateExpression.apply( self, [ argument ] ) );
                }
            }
            element.argumentValues = argumentValues;
        }
        var currentObject = self;

        for ( var keyPathIndex = 0; keyPathIndex < (keyPathElements.length - 1); keyPathIndex++ ) {
            var keyPathElement = keyPathElements[keyPathIndex];
            var keyPathValue = __keyValueCoding.__valueForKeyPathElement_onObject.apply( self, [ keyPathElement, currentObject ] );
            if ( typeof keyPathValue === "object" ) {
                currentObject = keyPathValue;
            } else {
                return [null, null];
            }
        }
        return [ currentObject, keyPathElements[keyPathElements.length - 1] ];
    },

    // TODO: will flesh this out later
    __listOfPossibleKeyNames: function(key) {
        var niceName = KVU._p_niceName(key);
        return [key, "_" + key, niceName, "_" + niceName];
    },

    __evaluateExpression: function(expression) {
        var self = this;
        return eval(expression);
    },

    // This takes a string template
    // like "foo fah fum ${twiddle.blah.zap} tiddly pom" and a language (which
    // you can use in your evaluations) and returns the string with the
    // resolved keypaths interpolated.
    __stringWithEvaluatedKeyPathsInLanguage: function(str, language) {
        var self = this;
        if (!str) { return "" }
        var count = 0;
        var TEMPLATE_RE = new RegExp("\\${(.*?)}");
        var match = str.match( TEMPLATE_RE );
        while (match) {
            var keyValuePath = match[1];
            var v = "";

            if ( KVU.expressionIsKeyPath( keyValuePath )) {
                v = __keyValueCoding.__valueForKeyPath.apply( self, [ keyValuePath ] );
            } else {
                v = eval( keyValuePath ); // yikes, dangerous!
            }

            // \Q and \E makes the regex ignore the inbetween values if they have regex special items which we probably will for the dots (.).
            var re = new RegExp("\\$\{" + KVU._p_quotemeta( keyValuePath ) + "\}", "g");
            str = str.replace( re, v );
            // Avoiding the infinite loop...just in case
            if (count++ > 100) { break }
            match = str.match( TEMPLATE_RE );
        }
        return str;
    }
};

// This is the API that is made available to objects

exports.KeyValueCoding = {
    valueForKey:          __keyValueCoding.__valueForKey,
    setValueForKey:       __keyValueCoding.__setValue_forKey,
    valueForKeyPath:      __keyValueCoding.__valueForKeyPath,
    setValueForKeyPath:   __keyValueCoding.__setValue_forKeyPath,
    stringWithEvaluatedKeyPathsInLanguage: __keyValueCoding.__stringWithEvaluatedKeyPathsInLanguage
};

