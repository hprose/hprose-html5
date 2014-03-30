/**********************************************************\
|                                                          |
|                          hprose                          |
|                                                          |
| Official WebSite: http://www.hprose.com/                 |
|                   http://www.hprose.net/                 |
|                   http://www.hprose.org/                 |
|                                                          |
\**********************************************************/

/**********************************************************\
 *                                                        *
 * Formatter.js                                           *
 *                                                        *
 * hprose Formatter for HTML5.                            *
 *                                                        *
 * LastModified: Mar 28, 2014                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global) {
    'use strict';

    var BytesIO = global.hprose.BytesIO;
    var Writer = global.hprose.Writer;
    var Reader = global.hprose.Reader;

    global.hprose.serialize = function serialize(value, simple) {
        var stream = new BytesIO();
        var writer = new Writer(stream, simple);
        writer.serialize(value);
        return stream;
    };

    global.hprose.unserialize = function unserialize(stream, simple, useHarmonyMap) {
        return new Reader(stream, simple, useHarmonyMap).unserialize();
    };

    global.hprose.Formatter = {
        serialize: function (value, simple) {
            return global.hprose.serialize(value, simple).takeBytes();
        },
        unserialize: function (bytes, simple, useHarmonyMap) {
            return global.hprose.unserialize(new BytesIO(bytes), simple, useHarmonyMap);
        }
    };

})(this);