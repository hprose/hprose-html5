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
 * Future.js                                              *
 *                                                        *
 * hprose Future for HTML5.                               *
 *                                                        *
 * LastModified: Mar 5, 2015                              *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global) {
    'use strict';

    global.hprose = global.hprose || Object.create(null);

    function Future() {}

    global.hprose.Completer = function Completer() {
        var callback = null;
        var errorCallback = null;
        var results = [];
        var errors = [];
        var future = Object.create(Future.prototype);

        function complete(result) {
            if (callback) {
                callback(result);
            }
            else {
                results.push(result);
            }
        }

        function completeError(error) {
            if (errorCallback) {
                errorCallback(error);
            }
            else {
                errors.push(error);
            }
        }

        function then(handler) {
            callback = handler;
            if (results.length > 0) {
                for (var result in results) {
                    callback(result);
                }
                results = [];
            }
            return future;
        }

        function catchError(errorHandler) {
            errorCallback = errorHandler;
            if (errors.length > 0) {
                for (var error in errors) {
                    errorCallback(error);
                }
                errors = [];
            }
            return future;
        }

        Object.defineProperties(future, {
            then: { value: then },
            catchError: { value: catchError },
        });

        Object.defineProperties(this, {
            future: { get: function() { return future; } },
            complete: { value : complete },
            completeError: { value : completeError }
        });
    };

})(this);
