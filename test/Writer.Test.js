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
    "use strict";
    console.log(hprose.serialize(0).toString());
    console.log(hprose.serialize(-0).toString());
    console.log(hprose.serialize(new Number(0)).toString());
    console.log(hprose.serialize(new Number(-0)).toString());
    console.log(hprose.serialize(100).toString());
    console.log(hprose.serialize(2147483647).toString());
    console.log(hprose.serialize(2147483648).toString());
    console.log(hprose.serialize(-2147483648).toString());
    console.log(hprose.serialize(-2147483649).toString());
    console.log(hprose.serialize(true).toString());
    console.log(hprose.serialize(new Boolean(false)).toString());
    console.log(hprose.serialize("Hello").toString());
    console.log(hprose.serialize(["你","A",""]).toString());
    console.log(hprose.serialize(new String("你好")).toString());
    console.log(hprose.serialize(new Uint8Array([0x30, 0x31, 0x32])).toString());
    console.log(hprose.serialize(new Int8Array([0x30, 0x31, 0x32])).toString());
    console.log(hprose.serialize(new Int32Array([2147483647, 2147483648, -2147483648,-2147483649])).toString());
    console.log(hprose.serialize(new Uint32Array([2147483647, 2147483648, -2147483648,-2147483649])).toString());
    console.log(hprose.serialize(new Float32Array([NaN,Infinity,-Infinity,1.1,2.3])).toString());
    console.log(hprose.serialize(new Float64Array([NaN,Infinity,-Infinity,1.1,2.3])).toString());
    var map = new Map();
    map.set(map, map);
    map.set(-0, "-0");
    map.set(0, "+0");
    console.log(hprose.serialize(map).toString());
    function User() {}
    var user = new User();
    user.name = "张三";
    user.age = 28;
    user.lastLogin = new Date();
    console.log(hprose.serialize(user).toString());
    console.log(hprose.serialize({name:"张三", age:28, lastLogin:new Date()}).toString());
})();