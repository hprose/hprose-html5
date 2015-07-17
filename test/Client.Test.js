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
        var args = [weeks];
        result = client.invoke('swapKeyAndValue', args, true);
        console.info(result);
        result.then(function(result) {
            console.info(weeks);
            console.info(result);
            console.info(args[0]);
        })
        .catchError(function(e) {
            console.error(e);
        });
        console.info(stub.getUserList());
        client.beginBatch();
        console.info(stub.hello('World'));
        console.info(stub.sum(1,2,3,4,5));
        var args2 = [weeks];
        stub.swapKeyAndValue(weeks, function(result, args) {
            console.info(weeks);
            console.info(result);
            console.info(args[0]);
        }, true);
        console.info(client.getUserList());
        client.endBatch();
    },
    function(e) {
        console.error(e);
    });

})();
