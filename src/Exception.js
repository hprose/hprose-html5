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
 * LastModified: May 5, 2015                              *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global) {
    'use strict';

    global.hprose.Exception = function Exception(message) {
        this.message = message;
    };

    global.hprose.Exception.prototype = new Error();
    global.hprose.Exception.prototype.name = 'hprose.Exception';

})(this);