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
 * AsyncLoader.js                                         *
 *                                                        *
 * hprose asynchronous loader for HTML5.                  *
 *                                                        *
 * LastModified: Apr 19, 2015                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global) {
    'use strict';
    global.hprose = global.hprose || Object.create(null);
    if (typeof define === "function") {
        if (define.cmd) {
            define('hprose', [], global.hprose);
        }
        else if (define.amd) {
            define("hprose", [], function() { return global.hprose; });
        }
    }
})(this);