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
 * LastModified: Apr 17, 2015                             *
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
    client.then(function(stub) {
        stub.hello('World')
        .then(function(result) {
            console.info(result);
        });
        stub.sum(1,2,3,4,5)
        .then(function(result) {
            console.info(result);
            return stub.sum(result, 6, 7, 8);
        })
        .then(function(result) {
            console.info(result);
            return stub.sum(result, 9);
        })
        .then(function(result) {
            console.info(result);
            return stub.sum(result, 10, 11, 12);
        })
        .then(function(result) {
            console.info(result);
            return stub.sum(result, 13);
        })
        .then(function(result) {
            console.info(result);
            return result + 14;
        })
        .then(function(result) {
            console.info(result);
            return result + 15;
        })
        .then(function(result) {
            console.info(result);
        });
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
        client.invoke('swapKeyAndValue', args, true)
        .then(function(result) {
            console.info(weeks);
            console.info(result);
            console.info(args[0]);
        })
        .catchError(function(e) {
            console.error(e);
        });
        stub.getUserList()
        .then(function(result) {
            console.info(result);
        });
        client.beginBatch();
        stub.hello('World')
        .then(function(result) {
            console.info(result);
        });
        stub.sum(1,2,3,4,5)
        .then(function(result) {
            console.info(result);
        });
        var args2 = [weeks];
        stub.swapKeyAndValue(weeks, function(result, args) {
            console.info(weeks);
            console.info(result);
            console.info(args[0]);
        }, true);
        client.getUserList()
        .then(function(result) {
            console.info(result);
        });
        client.endBatch();
    })
    .catchError(function(e) {
        console.error(e);
    });

})();
