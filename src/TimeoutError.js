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
 * TimeoutError.js                                        *
 *                                                        *
 * hprose TimeoutError for HTML5.                         *
 *                                                        *
 * LastModified: Jul 17, 2015                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

/* jshint -W067 */
(function (global, undefined) {
    'use strict';

    function TimeoutError(message) {
        Error.call(this);
        this.message = message;
        this.name = TimeoutError.name;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, TimeoutError);
        }
    }

    TimeoutError.prototype = Object.create(Error.prototype);
    TimeoutError.prototype.constructor = TimeoutError;

    global.hprose.TimeoutError = TimeoutError;

}(function() {
    return this || (1, eval)('this');
}()));
