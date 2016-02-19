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
 * setImmediate.js                                        *
 *                                                        *
 * setImmediate for HTML5.                                *
 *                                                        *
 * LastModified: Feb 19, 2016                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

/* jshint -W067 */
(function(global, undefined) {
    'use strict';

    // @see http://codeforhire.com/2013/09/21/setimmediate-and-messagechannel-broken-on-internet-explorer-10/
    var notUseNative = (global.navigator && /Trident/.test(global.navigator.userAgent));

    if (!notUseNative && (global.msSetImmediate || global.setImmediate)) {
        if (!global.setImmediate) {
            global.setImmediate = global.msSetImmediate;
            global.clearImmediate = global.msClearImmediate;
        }
        return;
    }

    var doc = global.document;
    var polifill = {};
    var nextId = 1;
    var tasks = {};
    var lock = false;

    function wrap(handler) {
        var args = [].slice.call(arguments, 1);
        return function() {
            handler.apply(undefined, args);
        };
    }

    function clear(handleId) {
        delete tasks[handleId];
    }

    function run(handleId) {
        if (lock) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a "too much recursion" error.
            global.setTimeout(wrap(run, handleId), 0);
        } else {
            var task = tasks[handleId];
            if (task) {
                lock = true;
                try {
                    task();
                }
                finally {
                    clear(handleId);
                    lock = false;
                }
            }
        }
    }

    function create(args) {
        tasks[nextId] = wrap.apply(undefined, args);
        return nextId++;
    }

    polifill.messageChannel = function() {
        var channel = new global.MessageChannel();

        channel.port1.onmessage = function(event) {
            run(Number(event.data));
        };

        return function() {
            var handleId = create(arguments);
            channel.port2.postMessage(handleId);
            return handleId;
        };
    };

    polifill.nextTick = function() {
        return function() {
            var handleId = create(arguments);
            global.process.nextTick( wrap( run, handleId ) );
            return handleId;
        };
    };

    polifill.postMessage = function() {
        var messagePrefix = 'setImmediate$' + Math.random() + '$';

        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof(event.data) === 'string' &&
                event.data.indexOf(messagePrefix) === 0) {

                run(Number(event.data.slice(messagePrefix.length)));
            }
        };

        if (global.addEventListener) {
            global.addEventListener('message', onGlobalMessage, false);

        } else {
            global.attachEvent('onmessage', onGlobalMessage);
        }

        return function() {
            var handleId = create(arguments);
            global.postMessage(messagePrefix + handleId, '*');
            return handleId;
        };
    };

    polifill.readyStateChange = function() {
        var html = doc.documentElement;

        return function() {
            var handleId = create(arguments);
            var script = doc.createElement('script');

            script.onreadystatechange = function() {
                run(handleId);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };

            html.appendChild(script);

            return handleId;
        };
    };

    polifill.setTimeout = function() {
        return function() {
            var handleId = create(arguments);
            global.setTimeout( wrap( run, handleId ), 0 );
            return handleId;
        };
    };

    function canUsePostMessage() {
        if (global.postMessage && !global.importScripts) {
            var asynch = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                asynch = false;
            };
            global.postMessage('', '*');
            global.onmessage = oldOnMessage;
            return asynch;
        }
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = (attachTo && attachTo.setTimeout ? attachTo : global);

    if (notUseNative) {
        attachTo.setImmediate = polifill.setTimeout();

    // Don't get fooled by e.g. browserify environments.
    // For Node.js before 0.9
    } else if ({}.toString.call(global.process) === '[object process]') {
        attachTo.setImmediate = polifill.nextTick();

    // For non-IE10 modern browsers
    } else if (canUsePostMessage()) {
        attachTo.setImmediate = polifill.postMessage();

    // For web workers, where supported
    } else if (global.MessageChannel) {
        attachTo.setImmediate = polifill.messageChannel();

    // For IE 6–8
    } else if (doc && ('onreadystatechange' in doc.createElement('script'))) {
        attachTo.setImmediate = polifill.readyStateChange();

    // For older browsers
    } else {
        attachTo.setImmediate = polifill.setTimeout();
    }

    attachTo.msSetImmediate = attachTo.setImmediate;

    attachTo.clearImmediate = clear;
    attachTo.msClearImmediate = clear;

}(function() {
    return this || (1, eval)('this');
}()));
