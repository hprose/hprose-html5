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
        var m_results = [];
        var m_callbacks = [];
        var m_errors = [];
        var m_onerror = null;
        var m_future = Object.create(null);

        function completeError(e) {
            if (m_onerror !== null) {
                m_onerror(e);
            }
            else {
                m_errors.push(e);
            }
        }

        // Calling complete must not be done more than once.
        function complete(result) {
            m_results[0] = result;
            if (m_callbacks.length > 0) {
                for (var i in m_callbacks) {
                    try {
                        var callback = m_callbacks[i];
                        m_results[0] = callback(m_results[0]);
                    }
                    catch (e) {
                        completeError(e);
                    }
                }
                m_callbacks.length = 0;
            }
        }

        function catchError(onerror) {
            m_onerror = onerror;
            for (var i in m_errors) {
                onerror(m_errors[i]);
            }
            m_errors.length = 0;
            return m_future;
        }

        function then(callback) {
            if (m_results.length > 0) {
                try {
                    m_results[0] = callback(m_results[0]);
                }
                catch (e) {
                    completeError(e);
                }
            }
            else {
                m_callbacks.push(callback);
            }
            return m_future;
        }

        Object.defineProperties(m_future, {
            then: { value: then },
            catchError: { value: catchError },
        });

        Object.defineProperties(this, {
            future: { get: function() { return m_future; } },
            complete: { value : complete },
            completeError: { value : completeError }
        });
    };

})(this);
