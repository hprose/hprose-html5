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
 * HarmonyMaps.Test.js                                    *
 *                                                        *
 * Harmony Maps test for HTML5.                           *
 *                                                        *
 * LastModified: Mar 27, 2014                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

/*global Map */
/*jshint eqeqeq:true, devel:true */

(function() {
    "use strict";
    function logMapElements(value, key) {
        console.log("m[" + key + "] = " + value);
    }
    var map = new Map();
    map.set("foo", 3);
    map.set(map, "self");
    map.set(0, 1);
    map.set(-0, 2);
    map.forEach(logMapElements);
    console.log(map.size);
    map.delete(map);
    map.forEach(logMapElements);
    map.clear();
    map.forEach(logMapElements);
    console.log(map.size);
})();