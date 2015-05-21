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
 * LastModified: May 21, 2015                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global) {
    'use strict';

    function Exception(message) {
        this.message = message;
    }

    Exception.prototype = new Error();
    Exception.prototype.name = 'hprose.Exception';

    global.hprose.Exception = Exception;

})(this);