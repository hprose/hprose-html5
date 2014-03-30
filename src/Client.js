/**********************************************************\
|                                                          |
|                          hprose                          |
|                                                          |
| Official WebSite: http://www.hprose.com/                 |
|                   http://www.hprose.net/                 |
|                   http://www.hprose.org/                 |
|                                                          |
\**********************************************************/
/**********************************************************\
 *                                                        *
 * Client.js                                              *
 *                                                        *
 * hprose client for HTML5.                               *
 *                                                        *
 * LastModified: Mar 29, 2014                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global) {
    'use strict';

    var Tags = global.hprose.Tags;
    var Exception = global.hprose.Exception;
    var ResultMode = global.hprose.ResultMode;
    var BytesIO = global.hprose.BytesIO;
    var Writer = global.hprose.Writer;
    var Reader = global.hprose.Reader;

    var GETFUNCTIONS = new Uint8Array(1);
    GETFUNCTIONS[0] = Tags.TagEnd;
    function noop(){}

    var s_boolean = 'boolean';
    var s_string = 'string';
    var s_number = 'number';
    var s_function = 'function';
    var s_OnError = '_OnError';
    var s_onError = '_onError';
    var s_onerror = '_onerror';
    var s_Callback = '_Callback';
    var s_callback = '_callback';
    var s_OnSuccess = '_OnSuccess';
    var s_onSuccess = '_onSuccess';
    var s_onsuccess = '_onsuccess';

    global.hprose.Client = function Client(uri, functions) {
        // private members
        var _uri;
        var _ready         = false;
        var _byref         = false;
        var _simple        = false;
        var _useHarmonyMap = false;
        var _onerror       = noop;
        var _onready       = noop;
        var _filters       = [];
        var _batch         = false;
        var _batches       = [];

        var self = this;

        // private methods
        function sendAndReceive(request, callback) {
            for (var i = 0, n = _filters.length; i < n; i++) {
                request = _filters[i].outputFilter(request, self);
            }
            self.__send__(request, function(response, needToFilter) {
                if (needToFilter) {
                    for (var i = _filters.length - 1; i >= 0; i--) {
                        response = _filters[i].inputFilter(response, self);
                    }
                }
                callback(response);
            });
        }

        function initService(stub) {
            sendAndReceive(GETFUNCTIONS, function (data) {
                var error = null;
                try {
                    var stream = new BytesIO(data);
                    var reader = new Reader(stream, true);
                    var tag = stream.readByte();
                    switch (tag) {
                        case Tags.TagError:
                            error = new Exception(reader.readString());
                            break;
                        case Tags.TagFunctions:
                            var functions = reader.readList();
                            reader.checkTag(Tags.TagEnd);
                            setFunctions(stub, functions);
                            break;
                        default:
                            error = new Exception('Wrong Response:\r\n' + stream.toString());
                            break;
                    }
                }
                catch (e) {
                    error = e;
                }
                if (error !== null) {
                    _onerror('useService', error);
                }
            });
        }

        function setFunction(stub, func) {
            return function () {
                return _invoke(stub, func, arguments);
            };
        }

        function setMethods(stub, obj, namespace, name, methods) {
            if (obj[name] !== undefined) return;
            obj[name] = {};
            if (typeof(methods) === s_string || methods.constructor === Object) {
                methods = [methods];
            }
            if (Array.isArray(methods)) {
                for (var i = 0; i < methods.length; i++) {
                    var m = methods[i];
                    if (typeof(m) === s_string) {
                        obj[name][m] = setFunction(stub, namespace + name + '_' + m);
                    }
                    else {
                        for (var n in m) {
                            setMethods(stub, obj[name], name + '_', n, m[n]);
                        }
                    }
                }
            }
        }

        function setFunctions(stub, functions) {
            for (var i = 0; i < functions.length; i++) {
                var f = functions[i];
                if (typeof(f) === s_string) {
                    if (stub[f] === undefined) {
                        stub[f] = setFunction(stub, f);
                    }
                }
                else {
                    for (var name in f) {
                        setMethods(stub, stub, '', name, f[name]);
                    }
                }
            }
            _ready = true;
            _onready();
        }

        function _invoke(stub, func, args) {
            var resultMode = ResultMode.Normal, stream;
            if (!_batch && !_batches.length || _batch) {
                var byref = _byref;
                var simple = _simple;
                var lowerCaseFunc = func.toLowerCase();
                var errorHandler = stub[func + s_OnError] ||
                                   stub[func + s_onError] ||
                                   stub[func + s_onerror] ||
                                   stub[lowerCaseFunc + s_OnError] ||
                                   stub[lowerCaseFunc + s_onError] ||
                                   stub[lowerCaseFunc + s_onerror] ||
                                   self[func + s_OnError] ||
                                   self[func + s_onError] ||
                                   self[func + s_onerror] ||
                                   self[lowerCaseFunc + s_OnError] ||
                                   self[lowerCaseFunc + s_onError] ||
                                   self[lowerCaseFunc + s_onerror];
                var callback = stub[func + s_Callback] ||
                               stub[func + s_callback] ||
                               stub[func + s_OnSuccess] ||
                               stub[func + s_onSuccess] ||
                               stub[func + s_onsuccess] ||
                               stub[lowerCaseFunc + s_Callback] ||
                               stub[lowerCaseFunc + s_callback] ||
                               stub[lowerCaseFunc + s_OnSuccess] ||
                               stub[lowerCaseFunc + s_onSuccess] ||
                               stub[lowerCaseFunc + s_onsuccess] ||
                               self[func + s_Callback] ||
                               self[func + s_callback] ||
                               self[func + s_OnSuccess] ||
                               self[func + s_onSuccess] ||
                               self[func + s_onsuccess] ||
                               self[lowerCaseFunc + s_Callback] ||
                               self[lowerCaseFunc + s_callback] ||
                               self[lowerCaseFunc + s_OnSuccess] ||
                               self[lowerCaseFunc + s_onSuccess] ||
                               self[lowerCaseFunc + s_onsuccess];
                var count = args.length;
                var tArg5 = typeof(args[count - 5]);
                var tArg4 = typeof(args[count - 4]);
                var tArg3 = typeof(args[count - 3]);
                var tArg2 = typeof(args[count - 2]);
                var tArg1 = typeof(args[count - 1]);
                if (tArg1 === s_boolean &&
                    tArg2 === s_number &&
                    tArg3 === s_boolean &&
                    tArg4 === s_function &&
                    tArg5 === s_function) {
                    simple = args[count - 1];
                    resultMode = args[count - 2];
                    byref = args[count - 3];
                    errorHandler = args[count - 4];
                    callback = args[count - 5];
                    delete args[count - 1];
                    delete args[count - 2];
                    delete args[count - 3];
                    delete args[count - 4];
                    delete args[count - 5];
                    args.length -= 5;
                }
                else if (tArg1 === s_boolean &&
                         tArg2 === s_number &&
                         tArg3 === s_function &&
                         tArg4 === s_function) {
                    simple = args[count - 1];
                    resultMode = args[count - 2];
                    errorHandler = args[count - 3];
                    callback = args[count - 4];
                    delete args[count - 1];
                    delete args[count - 2];
                    delete args[count - 3];
                    delete args[count - 4];
                    args.length -= 4;
                }
                else if (tArg1 === s_number &&
                         tArg2 === s_boolean &&
                         tArg3 === s_function &&
                         tArg4 === s_function) {
                    resultMode = args[count - 1];
                    byref = args[count - 2];
                    errorHandler = args[count - 3];
                    callback = args[count - 4];
                    delete args[count - 1];
                    delete args[count - 2];
                    delete args[count - 3];
                    delete args[count - 4];
                    args.length -= 4;
                }
                else if (tArg1 === s_boolean &&
                         tArg2 === s_boolean &&
                         tArg3 === s_function &&
                         tArg4 === s_function) {
                    simple = args[count - 1];
                    byref = args[count - 2];
                    errorHandler = args[count - 3];
                    callback = args[count - 4];
                    delete args[count - 1];
                    delete args[count - 2];
                    delete args[count - 3];
                    delete args[count - 4];
                    args.length -= 4;
                }
                else if (tArg1 === s_boolean &&
                         tArg2 === s_function &&
                         tArg3 === s_function) {
                    byref = args[count - 1];
                    errorHandler = args[count - 2];
                    callback = args[count - 3];
                    delete args[count - 1];
                    delete args[count - 2];
                    delete args[count - 3];
                    args.length -= 3;
                }
                else if (tArg1 === s_number &&
                         tArg2 === s_function &&
                         tArg3 === s_function) {
                    resultMode = args[count - 1];
                    errorHandler = args[count - 2];
                    callback = args[count - 3];
                    delete args[count - 1];
                    delete args[count - 2];
                    delete args[count - 3];
                    args.length -= 3;
                }
                else if (tArg1 === s_function &&
                         tArg2 === s_function) {
                    errorHandler = args[count - 1];
                    callback = args[count - 2];
                    delete args[count - 1];
                    delete args[count - 2];
                    args.length -= 2;
                }
                else if (tArg1 === s_boolean &&
                         tArg2 === s_number &&
                         tArg3 === s_boolean &&
                         tArg4 === s_function) {
                    simple = args[count - 1];
                    resultMode = args[count - 2];
                    byref = args[count - 3];
                    callback = args[count - 4];
                    delete args[count - 1];
                    delete args[count - 2];
                    delete args[count - 3];
                    delete args[count - 4];
                    args.length -= 4;
                }
                else if (tArg1 === s_boolean &&
                         tArg2 === s_number &&
                         tArg3 === s_function) {
                    simple = args[count - 1];
                    resultMode = args[count - 2];
                    callback = args[count - 3];
                    delete args[count - 1];
                    delete args[count - 2];
                    delete args[count - 3];
                    args.length -= 3;
                }
                else if (tArg1 === s_number &&
                         tArg2 === s_boolean &&
                         tArg3 === s_function) {
                    resultMode = args[count - 1];
                    byref = args[count - 2];
                    callback = args[count - 3];
                    delete args[count - 1];
                    delete args[count - 2];
                    delete args[count - 3];
                    args.length -= 3;
                }
                else if (tArg1 === s_boolean &&
                         tArg2 === s_boolean &&
                         tArg3 === s_function) {
                    simple = args[count - 1];
                    byref = args[count - 2];
                    callback = args[count - 3];
                    delete args[count - 1];
                    delete args[count - 2];
                    delete args[count - 3];
                    args.length -= 3;
                }
                else if (tArg1 === s_boolean &&
                         tArg2 === s_function) {
                    byref = args[count - 1];
                    callback = args[count - 2];
                    delete args[count - 1];
                    delete args[count - 2];
                    args.length -= 2;
                }
                else if (tArg1 === s_number &&
                         tArg2 === s_function) {
                    resultMode = args[count - 1];
                    callback = args[count - 2];
                    delete args[count - 1];
                    delete args[count - 2];
                    args.length -= 2;
                }
                else if (tArg1 === s_function) {
                    callback = args[count - 1];
                    delete args[count - 1];
                    args.length--;
                }
                stream = new BytesIO();
                stream.writeByte(Tags.TagCall);
                var writer = new Writer(stream, simple);
                writer.writeString(func);
                if (args.length > 0 || byref) {
                    writer.reset();
                    writer.writeList(args);
                    if (byref) {
                        writer.writeBoolean(true);
                    }
                }

                if (_batch) {
                    _batches.push({args: args,
                                   func: func,
                                   data: stream.bytes,
                                   callback: callback,
                                   errorHandler: errorHandler});
                }
                else {
                    stream.writeByte(Tags.TagEnd);
                }
            }

            if (!_batch) {
                var batchSize = _batches.length;
                var batch = !!batchSize;
                var request = new BytesIO();
                if (batch) {
                    for (var i = 0; i < batchSize; ++i) {
                        request.write(_batches[i].data);
                        delete _batches[i].data;
                    }
                    request.writeByte(Tags.TagEnd);
                }
                else {
                    request = stream;
                }

                var batches = _batches.slice(0);
                _batches.length = 0;

                sendAndReceive(request.bytes, function (response) {
                    var result = null;
                    var error = null;
                    var i;
                    if (resultMode === ResultMode.RawWithEndTag) {
                        result = response;
                    }
                    else if (resultMode === ResultMode.Raw) {
                        result = response.subarray(0, response.byteLength - 1);
                    }
                    else {
                        var stream = new BytesIO(response);
                        var reader = new Reader(stream, false, _useHarmonyMap);
                        var tag;
                        i = -1;
                        try {
                            while ((tag = stream.readByte()) !== Tags.TagEnd) {
                                switch (tag) {
                                case Tags.TagResult:
                                    if (resultMode === ResultMode.Serialized) {
                                        result = reader.readRaw();
                                    }
                                    else {
                                        reader.reset();
                                        result = reader.unserialize();
                                    }
                                    if (batch) {
                                        batches[++i].result = result;
                                        batches[i].error = null;
                                    }
                                    break;
                                case Tags.TagArgument:
                                    reader.reset();
                                    args = reader.readList();
                                    if (batch) {
                                        batches[i].args = args;
                                    }
                                    break;
                                case Tags.TagError:
                                    reader.reset();
                                    error = new Exception(reader.readString());
                                    if (batch) {
                                        batches[++i].error = error;
                                    }
                                    break;
                                default:
                                    error = new Exception('Wrong Response:\r\n' + response.toString());
                                    if (batch) {
                                        batches[++i].error = error;
                                    }
                                    break;
                                }
                            }
                        }
                        catch (e) {
                            error = e;
                            if (batch) {
                                batches[i < 0 ? 0 : i >= batchSize ? i - 1 : i].error = error;
                            }
                        }
                    }

                    if (!batch) {
                        batchSize  = 1;
                        batches = [{args: args,
                                    func: func,
                                    callback: callback,
                                    errorHandler: errorHandler,
                                    result: result,
                                    error: error}];
                    }
                    for (i = 0; i < batchSize; ++i) {
                        var item = batches[i];
                        if (item.error) {
                            if (item.errorHandler) {
                                item.errorHandler(item.func, item.error);
                            }
                            else {
                                _onerror(item.func, item.error);
                            }
                        }
                        else if (item.callback) {
                            item.callback(item.result, item.args);
                        }
                    }
                });
            }
        }

        // public methods
        function getOnError() {
            return _onerror;
        }
        function setOnError(value) {
            if (typeof(value) === s_function) {
                _onerror = value;
            }
        }
        function getOnReady() {
            return _onready;
        }
        function setOnReady(value) {
            if (typeof(value) === s_function) {
                _onready = value;
            }
        }
        function getReady() {
            return _ready;
        }
        function getUri() {
            return _uri;
        }
        function getByRef() {
            return _byref;
        }
        function setByRef(value) {
            if (value === undefined) value = true;
            _byref = !!value;
        }
        function getSimpleMode() {
            return _simple;
        }
        function setSimpleMode(value) {
            if (value === undefined) value = true;
            _simple = !!value;
        }
        function getUseHarmonyMap() {
            return _useHarmonyMap;
        }
        function setUseHarmonyMap(value) {
            if (value === undefined) value = true;
            _useHarmonyMap = !!value;
        }
        function getFilter() {
            if (_filters.length === 0) {
                return null;
            }
            return _filters[0];
        }
        function setFilter(filter) {
            _filters.length = 0;
            if (filter !== undefined && filter !== null) {
                _filters.push(filter);
            }
        }
        function addFilter(filter) {
            _filters.push(filter);
        }
        function removeFilter(filter) {
            var i = _filters.indexOf(filter);
            if (i === -1) {
                return false;
            }
            _filters.splice(i, 1);
            return true;
        }
        function useService(uri, functions, create) {
            if (typeof(functions) === s_boolean && create === undefined) {
                create = functions;
            }
            var stub = self;
            if (create) {
                stub = {};
            }
            _ready = false;
            if (uri === undefined) {
                return new Exception('You should set server uri first!');
            }
            _uri = uri;
            if (typeof(functions) === s_string ||
                (functions && functions.constructor === Object)) {
                functions = [functions];
            }
            if (Array.isArray(functions)) {
                setFunctions(stub, functions);
            }
            else {
                initService(stub);
            }
            return stub;
        }
        function invoke() {
            var args = arguments;
            var func = Array.prototype.shift.apply(args);
            return _invoke(self, func, args);
        }
        function beginBatch() {
            if(!_batch) {
                _batch = true;
            }
        }
        function endBatch() {
            _batch = false;
            if (_batches.length) {
                _invoke();
            }
        }
        /* function constructor */ {
            if (typeof(uri) === s_string) {
                useService(uri, functions);
            }
        }
        Object.defineProperties(this, {
            onError: {
                get: getOnError,
                set: setOnError,
                configurable: false,
                enumerable: false
            },
            onerror: {
                get: getOnError,
                set: setOnError,
                configurable: false,
                enumerable: false
            },
            onReady: {
                get: getOnReady,
                set: setOnReady,
                configurable: false,
                enumerable: false
            },
            onready: {
                get: getOnReady,
                set: setOnReady,
                configurable: false,
                enumerable: false
            },
            ready: {
                get : getReady,
                configurable: false,
                enumerable: false
            },
            uri: {
                get : getUri,
                configurable: false,
                enumerable: false
            },
            byref: {
                get : getByRef,
                set : setByRef,
                configurable: false,
                enumerable: false
            },
            simple: {
                get : getSimpleMode,
                set : setSimpleMode,
                configurable: false,
                enumerable: false
            },
            useHarmonyMap: {
                get : getUseHarmonyMap,
                set : setUseHarmonyMap,
                configurable: false,
                enumerable: false
            },
            filter: {
                get : getFilter,
                set : setFilter,
                configurable: false,
                enumerable: false
            },
            addFilter: {
                value: addFilter,
                writable: false,
                configurable: false,
                enumerable: false
            },
            removeFilter: {
                value: removeFilter,
                writable: false,
                configurable: false,
                enumerable: false
            },
            useService: {
                value: useService,
                writable: false,
                configurable: false,
                enumerable: false
            },
            invoke: {
                value: invoke,
                writable: false,
                configurable: false,
                enumerable: false
            },
            beginBatch: {
                value: beginBatch,
                writable: false,
                configurable: false,
                enumerable: false
            },
            endBatch: {
                value: endBatch,
                writable: false,
                configurable: false,
                enumerable: false
            }
        });
    };

    function create(uri, functions) {
        var parser = document.createElement('a');
        parser.href = uri;
        if (parser.protocol === 'http:' ||
            parser.protocol === 'https:') {
            return new global.hprose.HttpClient(uri, functions);
        }
        throw new Exception('The ' + parser.protocol + ' client isn\'t implemented.');
    }

    Object.defineProperty(global.hprose.Client, 'create', {
        value: create,
        writable: false,
        configurable: false,
        enumerable: false
    });
})(this);