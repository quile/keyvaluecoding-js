/* --------------------------------------------------------------------
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

 // Goop in here is just to help with the perl -> js conversion
 // and make my life a whole lot easier.  The general idea is
 // to use this during the port and then punt it when things
 // are "working".

var util = require("util");

exports._p_length = function(thing) {
    if (!thing) { return null }
    return thing.length;
};

exports._p_keys = function(thing) {
    if (!thing) { return [] }
    return Object.keys(thing);
};

exports._p_values = function(thing) {
    // if this is an objj object, send it an allKeys message
    if (!thing) { return [] }
    var values = [];
    for (key in _p_keys(thing)) {
        _p_push( values, thing[key] );
    }
    return values;
 };

exports._p_push = function(a, thing) {
    if (!a) { return }
    a[a.length] = thing;
};

_p_2_split = function(re, st) {
    var bits = st.split(re);
    var first = bits.shift();
    if (bits.length > 0) {
        st = st.replace(first, "");
        var second = st.substring(st.indexOf(bits.shift())) || "";
        return [first, second];
    }
    if (first == "") { return [] }
    return [first];
};
exports._p_2_split = _p_2_split;

_p_lcfirst = function(str) {
    return str.substr(0, 1).toLowerCase() + str.substr(1, str.length);
};
exports._p_lcfirst = _p_lcfirst;

_p_ucfirst = function(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1, str.length);
};
exports._p_ucfirst = _p_ucfirst;

exports._p_niceName = function(name) {
    if (name.match(/^[A-Z0-9_]+$/)) {
         return _p_lcfirst(name.split("_").map(function (_u) { return _p_ucfirst(_u.toLowerCase()) }).join(""));
    }
    return name;
};

_p_quotemeta = function(str) {
    return str.replace( /([^A-Za-z0-9])/g , "\\$1" );
}
exports._p_quotemeta = _p_quotemeta;

_p_trim = function(str) {
    return str.replace(/^\s+/, "").replace(/\s+$/, "");
}
exports._p_trim = _p_trim;

exports._p_can = function(object, method) {
    if ( typeof object[method] === 'function' ) {
        return true;
    }
    return false;
}

exports._p_keyNameFromNiceName = function(niceName) {
    var pieces = niceName.split(/([A-Z0-9])/);
    var uppercasePieces = [];

    for (var i=0; i<pieces.length; i++) {
        if (pieces[i] == "") { continue }
        if (pieces[i].match(/^[a-z0-9]$/)) {
            uppercasePieces.push(pieces[i].toUpperCase());
        } else if (pieces[i].match(/^[A-Z0-9]$/)) {
            // either it's an acronym, a single char or
            // a first char

            if (pieces[i+1] != "") {
                uppercasePieces.push((pieces[i] + pieces[i+1]).toUpperCase());
                i++;
            } else {
                var j = i;
                // acronyms
                var acronym = "";
                while (pieces[i+1] == "" && i < pieces.length) {
                    acronym = acronym + pieces[i];
                    i+=2;
                }
                uppercasePieces.push(acronym);
                if (i >= pieces.length) { break }
                i--;
            }
        } else {
            uppercasePieces.push(pieces[i].toUpperCase());
        }
    }
    var keyName = uppercasePieces.join("_");
    return keyName;
};

_p_isArray = function( v ) {
    if ( !v ) { return false }
    if ( typeof v !== "object" ) { return false }
    if ( v.constructor && v.constructor.name === "Array" ) { return true }
    return false;
};

exports._p_isArray = _p_isArray;


var KP_RE      = new RegExp('^[A-Za-z_\(\)]+[A-Za-z0-9_#\@\.\(\)\"]*$');
var KP_RE_PLUS = new RegExp('^[A-Za-z_\(\)]+[A-Za-z0-9_#\@]*[\(\.]+');
var QUOTE_RE   = new RegExp('["' + "']");
var OPEN_RE    = new RegExp("[\[\{\(]");
var KEY_RE     = new RegExp( "([a-zA-Z0-9_\@]+)\\(" );

exports.expressionIsKeyPath = function( expression ) {
    if ( !expression ) { return false }
    if ( expression.match(KP_RE) ) { return true }
    return expression.match(KP_RE_PLUS);
}

exports.keyPathElementsForPath = function( path ) {
    if ( !path.match(/\(/) ) {
        var bits = path.split(".");
        var elements = [];
        for ( var i = 0; i < bits.length; i++ ) {
            elements[elements.length] = { 'key': bits[i] };
        }
        // util.log( util.format( "key path elements: %j", elements ));
        return elements;
    }

    var keyPathElements = [];
    while (1) {
        var bits = _p_2_split(".", path);
        var firstElement = bits[0],
            rest = bits[1];
        if (!firstElement) { break; }
        var match = firstElement.match(KEY_RE);
        if ( match ) {
            var key = match[1];
            var element = new RegExp(_p_quotemeta(key + "("));
            path = path.replace(element, "");
            var argumentString = extractDelimitedChunk(path, ')');
            var quotedArguments = _p_quotemeta(argumentString + ")") + "\\.?";
            // extract arguments:
            var arguments = [];
            while (1) {
                var argument = extractDelimitedChunk(argumentString, ",");
                if (!argument) { break }
                arguments.push(_p_trim(argument));
                var quotedArgument = _p_quotemeta(argument) + ",?\\s*";
                argumentString = argumentString.replace(new RegExp(quotedArgument), "");
            }
            keyPathElements.push({ key: key, arguments: arguments });
            path = path.replace(new RegExp(quotedArguments), "");
        } else {
            if (firstElement) {
                keyPathElements.push({ key: firstElement });
            }
            path = rest;
        }
        if (!rest) { break }
    }
    // util.log( util.format( "key path elements: %j", keyPathElements ));
    return keyPathElements;
}

// It's easier to do it this way than to import Text::Balanced
extractDelimitedChunk = function( chunk, terminator ) {
    var extracted = "";
    var balanced = { '(': 0, '{': 0, '[': 0, '"': 0, "'": 0 };
    var isQuoting = false;
    var outerQuoteChar = '';

    var chars = chunk.split("");
    for (var i = 0; i < chars.length; i++) {
        var chrAt = chars[i];

        if (chrAt == '\\') {
            extracted = extracted + chars[i] + chars[i+1];
            i++;
            continue;
        }
        if (chrAt == terminator) {
            if (isBalanced(balanced)) {
                return extracted;
            }
        }

        if (!isQuoting) {
            if (chrAt.match(QUOTE_RE)) {
                isQuoting = true;
                outerQuoteChar = chrAt;
                balanced[chrAt]++;
            } else if (chrAt.match(OPEN_RE)) {
                balanced[chrAt]++;
            } else if (chrAt == ']') {
                balanced['[']--;
            } else if (chrAt == '}') {
                balanced['{']--;
            } else if (chrAt == ')') {
                balanced['(']--;
            }
        } else {
            if (chrAt == outerQuoteChar) {
                isQuoting = false;
                outerQuoteChar = '';
                balanced[chrAt] ++;
            }
        }

        extracted = extracted + chrAt;
    }
    if (isBalanced(balanced)) {
        return extracted;
    } else {
        util.error( "Error parsing keypath chunk; unbalanced '" + unBalanced(balanced) + "'" );
    }
    return "";
}
exports.extractDelimitedChunk;

exports.isBalanced = function( balanced ) {
    for (var ch in balanced) {
        if (ch.match(OPEN_RE) && balanced[ch] != 0) { return false }
        if (ch.match(QUOTE_RE) && balanced[ch] % 2 != 0) { return false }
    }
    return true;
}

exports.unBalanced = function( balanced ) {
    for (var ch in balanced) {
        if (ch.match(OPEN_RE) && balanced[ch] != 0) { return ch }
        if (ch.match(QUOTE_RE) && balanced[ch] % 2 != 0) { return ch }
    }
    return null;
}