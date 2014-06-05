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
    var methodList = ['hello', 'sum', 'swapKeyAndValue', 'getUserList'];
    var client = new hprose.Client.create('http://hprose.com/example/', methodList);
    client.onError = function(name, err) {
        console.error(name + ':' + err);
    };
    client.onprogress = function(e) {
        if (e.lengthComputable) {
          console.log((e.loaded / e.total) * 100);
        }
    };
    client.hello('World', function(result) {
        console.info(result);
    });
    client.sum(1,2,3,4,5, function(result) {
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
    client.swapKeyAndValue(weeks, function(result, args) {
        console.info(weeks);
        console.info(result);
        console.info(args[0]);
    }, true);
    client.getUserList(function(result) {
        console.info(result);
    });
    client.beginBatch();
    client.hello('World', function(result) {
        console.info(result);
    });
    client.sum(1,2,3,4,5, function(result) {
        console.info(result);
    });
    client.swapKeyAndValue(weeks, function(result, args) {
        console.info(weeks);
        console.info(result);
        console.info(args[0]);
    }, true);
    client.getUserList(function(result) {
        console.info(result);
    });
    client.endBatch();
})();