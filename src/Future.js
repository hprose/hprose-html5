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
 * LastModified: May 4, 2015                              *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global) {
    'use strict';

    global.hprose = global.hprose || Object.create(null);

    global.hprose.Completer = function Completer() {
        var callbacks = [];
        var errorCallback = null;
        var results = [];
        var errors = [];
        var future = Object.create(null);

        function complete(result) {
            results.push(result);
            if (callbacks.length > 0) {
                for (var i in callbacks) {
                    var handler = callbacks[i];
                    var result;
                    for (var j in results) {
                        try {
                            result = handler(results[j]);
                        }
                        catch (e) {
                            completeError(e);
                        }
                    }
                    results = [result];
                }
                callbacks = [];
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
            if (results.length > 0) {
                var result;
                for (var i in results) {
                    try {
                        result = handler(results[i]);
                    }
                    catch (e) {
                        completeError(e);
                    }
                }
                results = [result];
            }
            else {
                callbacks.push(handler);
            }
            return future;
        }

        function catchError(errorHandler) {
            errorCallback = errorHandler;
            if (errors.length > 0) {
                for (var i in errors) {
                    errorCallback(errors[i]);
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
