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
 * Formatter.js                                           *
 *                                                        *
 * hprose Formatter for HTML5.                            *
 *                                                        *
 * LastModified: Nov 18, 2016                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (hprose) {
    'use strict';

    var BytesIO = hprose.BytesIO;
    var Writer = hprose.Writer;
    var Reader = hprose.Reader;

    function serialize(value, simple) {
        var stream = new BytesIO();
        var writer = new Writer(stream, simple);
        writer.serialize(value);
        return stream;
    }

    function unserialize(stream, simple, useHarmonyMap) {
        if (!(stream instanceof BytesIO)) {
            stream = new BytesIO(stream);
        }
        return new Reader(stream, simple, useHarmonyMap).unserialize();
    }

    hprose.Formatter = {
        serialize: function (value, simple) {
            return serialize(value, simple).bytes;
        },
        unserialize: unserialize
    };

    hprose.serialize = serialize;

    hprose.unserialize = unserialize;

})(hprose);
