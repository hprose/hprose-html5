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
 * Future.Test.js                                         *
 *                                                        *
 * hprose Future test for HTML5.                          *
 *                                                        *
 * LastModified: Jun 22, 2015                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

/*global hprose */
/*jshint eqeqeq:true, devel:true */

(function() {
    "use strict";
    var completer = new hprose.Completer();
    var future = completer.future;
    completer.complete(1);
    future.then(function(result) {
        return result + 1;
    }).then(function(result) {
        return result + 1;
    }).then(function(result) {
        console.log(result);
    });
    future.then(function(result) {
        console.log(result);
    });
})();

(function() {
    "use strict";
    var completer = new hprose.Completer();
    var future = completer.future;
    completer.completeError(1);
    future.then(null, function(result) {
        return result + 1;
    }).then(function(result) {
        return result + 1;
    }).then(function(result) {
        console.log(result);
    });
    future.then(null, function(result) {
        console.log(result);
    });
})();
