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
 * Exception.js                                           *
 *                                                        *
 * hprose Exception for HTML5.                            *
 *                                                        *
 * LastModified: Mar 29, 2014                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global) {
    'use strict';

    global.hprose = global.hprose || Object.create(null);

    global.hprose.Exception = function Exception(message) {
        this.message = message;
    };

    global.hprose.Exception.prototype = new Error();
    global.hprose.Exception.prototype.name = 'hprose.Exception';

})(this);