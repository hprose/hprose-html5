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
 * Client.Test.js                                         *
 *                                                        *
 * hprose Client test for HTML5.                          *
 *                                                        *
 * LastModified: Jul 17, 2015                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

/*global hprose */
/*jshint eqeqeq:true, devel:true */

(function() {
    'use strict';
    //var methodList = ['hello', 'sum', 'swapKeyAndValue', 'getUserList'];
    //var client = new hprose.Client.create('http://hprose.com/example/', methodList);

    var client = hprose.Client.create('http://hprose.com/example/');
    client.onprogress = function(e) {
        if (e.lengthComputable) {
          console.log("progress: " + ((e.loaded / e.total) * 100));
        }
    };

    console.info = hprose.Future.wrap(console.info, console);

    client.ready(function(stub) {
        hprose.Future.run(console.log, console, stub.hello('World'));
        var result = stub.sum(1,2,3,4,5);
        console.info(result);
        result = stub.sum(result, 6, 7, 8);
        console.info(result);
        result = stub.sum(result, 9);
        console.info(result);
        result = stub.sum(result, 10, 11, 12);
        console.info(result);
        result = stub.sum(result, 13);
        console.info(result);
        var weeks = {
            'Monday': 'Mon',
            'Tuesday': 'Tue',
            'Wednesday': 'Wed',
            'Thursday': 'Thu',
            'Friday': 'Fri',
            'Saturday': 'Sat',
            'Sunday': 'Sun',
        };
        console.info(stub.swapKeyAndValue(weeks));
        console.info(stub.getUserList());
        client.batch.begin();
        console.info(stub.hello('World'));
        console.info(stub.sum(1,2,3,4,5));
        stub.swapKeyAndValue.byref = true;
        stub.swapKeyAndValue(weeks, function(result, args) {
            console.info(weeks);
            console.info(result);
            console.info(args[0]);
        });
        console.info(stub.getUserList());
        client.batch.end();
        stub.hello('World', function(result) {
            console.assert(result === undefined);
        }, { oneway: true });
        stub.hello('World', function(result) {
            console.assert(result === 'Hello World');
        }, { idempotent: true });
        stub.hello("world", function(){
          throw "Hello Error - 1!";
        },function(name, err){
          console.error("Error:", err);
        });
        stub.hello("world", function(){
          throw "Hello Error - 2!";
        }).catchError(function(err){
          console.error("Error:", err);
        });
        stub.hello("world").then(function(){
          throw "Hello Error - 3!";
        }).catchError(function(err){
          console.error("Error:", err);
        });
        stub.hello("world").then(function(){
          throw "Hello Error - 4!";
        },function(err){
          console.error("Error:", err); // must not run
        });

    },
    function(e) {
        console.error(e);
    });
})();
