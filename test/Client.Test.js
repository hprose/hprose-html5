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
 * Writer.Test.js                                         *
 *                                                        *
 * hprose Writer test for HTML5.                          *
 *                                                        *
 * LastModified: Mar 28, 2014                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

/*global hprose */
/*jshint eqeqeq:true, devel:true */

(function() {
    'use strict';
    //var methodList = ['hello', 'sum', 'swapKeyAndValue', 'getUserList'];
    //var client = new hprose.Client.create('http://hprose.com/example/', methodList);
    var client = new hprose.Client.create('http://hprose.com/example/')
    .then(function(client) {
        client.hello('World')
        .then(function(result) {
            console.info(result);
        });
        client.sum(1,2,3,4,5)
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
        client.getUserList()
        .then(function(result) {
            console.info(result);
        });
        client.beginBatch();
        client.hello('World')
        .then(function(result) {
            console.info(result);
        });
        client.sum(1,2,3,4,5)
        .then(function(result) {
            console.info(result);
        });
        var args2 = [weeks];
        client.swapKeyAndValue(weeks, function(result, args) {
            console.info(weeks);
            console.info(result);
            console.info(args[0]);
        }, true);
        client.getUserList()
        .then(function(result) {
            console.info(result);
        });
        client.endBatch();
    });
    client.onError = function(name, err) {
        console.error(name + ':' + err);
    };
    client.onprogress = function(e) {
        if (e.lengthComputable) {
          console.log((e.loaded / e.total) * 100);
        }
    };

})();
