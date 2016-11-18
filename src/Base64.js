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
 * Base64.js                                              *
 *                                                        *
 * Base64 for HTML5.                                      *
 *                                                        *
 * LastModified: Nov 18, 2016                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global) {
    'use strict';

    if (typeof(global.btoa) === "undefined") {
        global.btoa = (function() {
            var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
            return function(str) {
                var buf, i, j, len, r, l, c;
                i = j = 0;
                len = str.length;
                r = len % 3;
                len = len - r;
                l = (len / 3) << 2;
                if (r > 0) {
                    l += 4;
                }
                buf = new Array(l);

                while (i < len) {
                    c = str.charCodeAt(i++) << 16 |
                        str.charCodeAt(i++) << 8  |
                        str.charCodeAt(i++);
                    buf[j++] = base64EncodeChars[c >> 18] +
                               base64EncodeChars[c >> 12 & 0x3f] +
                               base64EncodeChars[c >> 6  & 0x3f] +
                               base64EncodeChars[c & 0x3f] ;
                }
                if (r === 1) {
                    c = str.charCodeAt(i++);
                    buf[j++] = base64EncodeChars[c >> 2] +
                               base64EncodeChars[(c & 0x03) << 4] +
                               "==";
                    }
                else if (r === 2) {
                    c = str.charCodeAt(i++) << 8 |
                        str.charCodeAt(i++);
                    buf[j++] = base64EncodeChars[c >> 10] +
                               base64EncodeChars[c >> 4 & 0x3f] +
                               base64EncodeChars[(c & 0x0f) << 2] +
                               "=";
                }
                return buf.join('');
            };
        })();
    }

    if (typeof(global.atob) === "undefined") {
        global.atob = (function() {
            var base64DecodeChars = [
                -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
                -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
                -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
                52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
                -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
                15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
                -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
                41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
            ];
            return function(str) {
                var c1, c2, c3, c4;
                var i, j, len, r, l, out;

                len = str.length;
                if (len % 4 !== 0) {
                    return '';
                }
                if (/[^ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789\+\/\=]/.test(str)) {
                    return '';
                }
                if (str.charAt(len - 2) === '=') {
                    r = 1;
                }
                else if (str.charAt(len - 1) === '=') {
                    r = 2;
                }
                else {
                    r = 0;
                }
                l = len;
                if (r > 0) {
                    l -= 4;
                }
                l = (l >> 2) * 3 + r;
                out = new Array(l);

                i = j = 0;
                while (i < len) {
                    // c1
                    c1 = base64DecodeChars[str.charCodeAt(i++)];
                    if (c1 === -1) { break; }

                    // c2
                    c2 = base64DecodeChars[str.charCodeAt(i++)];
                    if (c2 === -1) { break; }

                    out[j++] = String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

                    // c3
                    c3 = base64DecodeChars[str.charCodeAt(i++)];
                    if (c3 === -1) { break; }

                    out[j++] = String.fromCharCode(((c2 & 0x0f) << 4) | ((c3 & 0x3c) >> 2));

                    // c4
                    c4 = base64DecodeChars[str.charCodeAt(i++)];
                    if (c4 === -1) { break; }

                    out[j++] = String.fromCharCode(((c3 & 0x03) << 6) | c4);
                }
                return out.join('');
            };
        })();
    }

})(hprose.global);
