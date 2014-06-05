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
 * BytesIO.Test.js                                        *
 *                                                        *
 * hprose BytesIO test for HTML5.                         *
 *                                                        *
 * LastModified: Mar 27, 2014                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

/*global hprose */
/*jshint eqeqeq:true, devel:true */

(function() {
    "use strict";
    var bytes = new hprose.BytesIO([1,2,3,4,5]);
    bytes.writeByte(0x30);
    bytes.writeByte(0x31);
    bytes.writeByte(0x32);
    bytes.writeByte(0x33);
    console.log(bytes.length);
    console.log(bytes.capacity);
    console.log(bytes.position);
    console.log(bytes.toBytes());
    var bytes2 = bytes.clone();
    bytes2.writeByte(0x34);
    bytes.writeByte(100);
    console.log(bytes.length);
    console.log(bytes.capacity);
    console.log(bytes.position);
    console.log(bytes2.toBytes());
    console.log(bytes.toBytes());
    bytes.write(bytes2);
    console.log(bytes.toBytes());
    var uint8Array = new Uint8Array(bytes2.toBytes().buffer, 3);
    var bytes3 = new hprose.BytesIO(uint8Array);
    bytes3.writeString("Hello World");
    bytes3.writeString("你好啊");
    console.log(uint8Array);
    console.log(bytes3.toBytes());
    console.log(bytes3.readByte());
    console.log(bytes3.readByte());
    console.log(bytes3.readByte());
    console.log(bytes3.read(2));
    console.log(bytes3.skip(2));
    console.log(bytes3.readAsciiString(11));
    console.log(bytes3.readBytes(165));
    console.log(bytes3.readByte());
    bytes3.mark();
    console.log(hprose.BytesIO.toString(bytes3.read(3)));
    bytes3.reset();
    console.log(bytes3.readUntil(0));
    bytes3.reset();
    console.log(bytes3.readString(1));
    bytes3.reset();
    console.log(bytes3.readBytes(0));
    console.log(bytes3.toString());
})();