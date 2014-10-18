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
 * JSONRPCClientFilter.js                                 *
 *                                                        *
 * jsonrpc client filter for JavaScript.                  *
 *                                                        *
 * LastModified: Oct 18, 2014                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global) {
    'use strict';

    var Tags = global.hprose.Tags;
    var BytesIO = global.hprose.BytesIO;
    var Writer = global.hprose.Writer;
    var Reader = global.hprose.Reader;

    var s_id = 1;

    global.hprose.JSONRPCClientFilter = {
        version: "2.0",
        inputFilter: function(value, context) {
            var response = JSON.parse(BytesIO.toString(value));
            var stream = new BytesIO();
            var writer = new Writer(stream, true);
            if (response.error) {
                stream.writeByte(Tags.TagError);
                writer.writeString(response.error.message);
            }
            else {
                stream.writeByte(Tags.TagResult);
                writer.serialize(response.result);
            }
            stream.writeByte(Tags.TagEnd);
            return stream.bytes;
        },
        outputFilter: function(value, context) {
            var request = {};
            if (this.version === "1.1") {
                request.version = "1.1";
            }
            else if (this.version === "2.0") {
                request.jsonrpc = "2.0";
            }
            var stream = new BytesIO(value);
            var reader = new Reader(stream, false, false);
            var tag = stream.readByte();
            if (tag === Tags.TagCall) {
                request.method = reader.readString();
                tag = stream.readByte();
                if (tag === Tags.TagList) {
                    request.params = reader.readListWithoutTag();
                }
            }
            request.id = s_id++;
            return JSON.stringify(request);
        }
    };

})(this);