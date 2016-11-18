/**********************************************************\
|                                                          |
|                          hprose                          |
|                                                          |
| Official WebSite: http://www.hprose.com/                 |
|                   http://www.hprose.org/                 |
|                                                          |
\**********************************************************/

/**********************************************************\
 *                                                        *
 * Helper.js                                              *
 *                                                        *
 * hprose helper for HTML5.                               *
 *                                                        *
 * LastModified: Nov 18, 2016                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (hprose, undefined) {
    'use strict';

    function generic(method) {
        if (typeof method !== "function") {
            throw new TypeError(method + " is not a function");
        }
        return function(context) {
            return method.apply(context, Array.prototype.slice.call(arguments, 1));
        };
    }

    var arrayLikeObjectArgumentsEnabled = true;

    try {
        String.fromCharCode.apply(String, new Uint8Array([1]));
    }
    catch (e) {
        arrayLikeObjectArgumentsEnabled = false;
    }

    function toArray(arrayLikeObject) {
        var n = arrayLikeObject.length;
        var a = new Array(n);
        for (var i = 0; i < n; ++i) {
            a[i] = arrayLikeObject[i];
        }
        return a;
    }

    var getCharCodes = arrayLikeObjectArgumentsEnabled ? function(bytes) { return bytes; } : toArray;

    function toBinaryString(bytes) {
        if (bytes instanceof ArrayBuffer) {
            bytes = new Uint8Array(bytes);
        }
        var n = bytes.length;
        if (n < 0xFFFF) {
            return String.fromCharCode.apply(String, getCharCodes(bytes));
        }
        var remain = n & 0x7FFF;
        var count = n >> 15;
        var a = new Array(remain ? count + 1 : count);
        for (var i = 0; i < count; ++i) {
            a[i] = String.fromCharCode.apply(String, getCharCodes(bytes.subarray(i << 15, (i + 1) << 15)));
        }
        if (remain) {
            a[count] = String.fromCharCode.apply(String, getCharCodes(bytes.subarray(count << 15, n)));
        }
        return a.join('');
    }

    function toUint8Array(bs) {
        var n = bs.length;
        var data = new Uint8Array(n);
        for (var i = 0; i < n; i++) {
            data[i] = bs.charCodeAt(i) & 0xFF;
        }
        return data;
    }

    var parseuri = function(url) {
        var pattern = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?");
        var matches =  url.match(pattern);
        var host = matches[4].split(':', 2);
        return {
            protocol: matches[1],
            host: matches[4],
            hostname: host[0],
            port: parseInt(host[1], 10) || 0,
            path: matches[5],
            query: matches[7],
            fragment: matches[9]
        };
    }

    var isObjectEmpty = function (obj) {
        if (obj) {
            var prop;
            for (prop in obj) {
                return false;
            }
        }
        return true;
    }

    hprose.generic = generic;
    hprose.toBinaryString = toBinaryString;
    hprose.toUint8Array = toUint8Array;
    hprose.toArray = toArray;
    hprose.parseuri = parseuri;
    hprose.isObjectEmpty = isObjectEmpty;

})(hprose);
