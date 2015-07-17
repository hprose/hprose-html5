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
    completer.complete(1);
})();

(function() {
    "use strict";
    var completer = new hprose.Completer();
    var future = completer.future;
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
    completer.completeError(1);
})();

(function() {
    "use strict";
    var Future = hprose.Future;
    var p1 = Future.delayed(500, function() { return "one"; });
    var p2 = Future.delayed(100, function() { return "two"; });
    Future.race([p1, p2]).then(function(value) {
        console.log(value);
    });
    Future.race([Future.resolve("p1"), "p2"]).then(function(value) {
        console.log(value);
    });
})();

(function() {
    "use strict";
    var Future = hprose.Future;
    var p1 = Future.delayed(500, function() { return "one"; });
    var p2 = Future.delayed(100, function() { return "two"; });
    Future.any([p1, p2]).then(function(value) {
        console.log(value);
    });
    Future.any([Future.resolve("p1"), "p2"]).then(function(value) {
        console.log(value);
    });
    Future.any([Future.error(1), Future.error(2)]).then(null, function(value) {
        console.log(value);
    });
    Future.any([]).then(null, function(value) {
        console.log(value);
    });
})();

(function() {
    "use strict";
    var Future = hprose.Future;
    var promise = Future.resolve(3);
    Future.all([true, promise]).then(function(values) {
       console.log(values); // [true, 3]
    });
})();

(function() {
    "use strict";
    var Future = hprose.Future;
    var promise = Future.resolve(3);
    Future.join(true, promise).then(function(values) {
       console.log(values); // [true, 3]
    });
})();

(function() {
    "use strict";
    var Future = hprose.Future;
    var promise = Future.resolve(3);
    Future.settle([true, promise, Future.error('e')]).then(function(values) {
       console.log(values); // [true, 3]
    });
})();

(function() {
    "use strict";
    var Future = hprose.Future;
    var promise = Future.resolve(3);
    console.log(promise.inspect()); // Object {state: "fulfilled", value: 3}
})();

(function() {
    "use strict";
    var Future = hprose.Future;
    var promise = Future.resolve(3);
    Future.forEach([true, promise], function(value) {
       console.log(value);
    });
     // true
     // 3
})();

(function() {
    "use strict";
    var Future = hprose.Future;
    var promise = Future.resolve(3);
    Future.resolve([true, promise]).forEach(function(value) {
       console.log(value);
    });
     // true
     // 3
})();

(function() {
    "use strict";
    var Future = hprose.Future;
    var promise = Future.resolve(3);
    Future.resolve([true, promise]).forEach(function(value) {
       console.log(value);
    });
     // true
     // 3
})();

(function() {
    "use strict";
    var Future = hprose.Future;
    function add(a, b) { return a + b; }
    var a = Future.resolve(3);
    var b = Future.resolve(5);
    Future.run(console.log, console, Future.run(add, null, a, b)); // 8
})();

(function() {
    "use strict";
    var Future = hprose.Future;
    Future.delayed(500, function() { return "one"; })
          .timeout(300)
          .then(function(value) {
              console.log(value);
          })
          .catchError(function(reason) {
              console.error(reason);
          }, function(e) {
              return e instanceof TimeoutError;
          });
})();
