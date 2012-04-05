/* --------------------------------------------------------------------
 * keyvaluecoding.js
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

// This is the public-facing interface to KVC.
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
// var kvc = require("./keyvaluecoding");
// ...
// kvc.install({ simple: true, target: thing });
//
// or jQuery style wrapping:
// var thing = {};
// thing = kvc(thing);


install = function( options ) {
    options = options || {};

    var kvc;
    if ( options['simple'] === true ) {
        kvc = require("./keyvaluecoding-simple").KeyValueCoding;
    } else {
        kvc = require("./keyvaluecoding-complex").KeyValueCoding;
    }

    var kva = {};
    if ( options['additions'] === true && !options['simple'] ) {
        kva = require("./keyvalueadditions").KeyValueAdditions;
    }

    var target = Object.prototype;
    if ( options['target'] ) {
        target = options['target'].prototype || options['target'];
    }

    // at this point we have a target

    for (var key in kvc) {
        if ( target[key] && !options['force'] ) {
            continue;
        }
        target[key] = kvc[key];
    }

    for (var key in kva) {
        if ( target[key] && !options['force'] ) {
            continue;
        }
        target[key] = kva[key];
    }
};

// munges an arbitrary object with kvc
kvc = function( obj, options ) {
    options = options || {};
    options['target'] = obj;
    install(options);
    return obj;
};


module.exports = {
    install: install,
    kvc: kvc
};