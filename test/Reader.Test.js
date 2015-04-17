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
 * Reader.Test.js                                         *
 *                                                        *
 * hprose Reader test for HTML5.                          *
 *                                                        *
 * LastModified: Apr 17, 2014                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

/*global hprose */
/*jshint eqeqeq:true, devel:true */

(function() {
    'use strict';
    console.assert(hprose.unserialize(hprose.serialize(0)) === 0);
    console.assert(hprose.unserialize(hprose.serialize(-0)) === -0);
    console.assert(hprose.unserialize(hprose.serialize(1)) === 1);
    console.assert(hprose.unserialize(hprose.serialize(-1)) === -1);
    console.assert(hprose.unserialize(hprose.serialize(-2147483648)) === -2147483648);
    console.assert(hprose.unserialize(hprose.serialize(2147483647)) === 2147483647);
    console.assert(hprose.unserialize(hprose.serialize(2147483648)) === 2147483648);
    console.assert(hprose.unserialize(hprose.serialize(0.1)) === 0.1);
    console.assert(hprose.unserialize(hprose.serialize(1e13)) === 1e13);
    console.assert(hprose.unserialize(hprose.serialize(1e235)) === 1e235);
    console.assert(hprose.unserialize(hprose.serialize(1e-235)) === 1e-235);
    console.assert(isNaN(hprose.unserialize(hprose.serialize(NaN))));
    console.assert(hprose.unserialize(hprose.serialize(Infinity)) === Infinity);
    console.assert(hprose.unserialize(hprose.serialize(-Infinity)) === -Infinity);
    console.assert(hprose.unserialize(hprose.serialize(true)) === true);
    console.assert(hprose.unserialize(hprose.serialize(false)) === false);
    console.assert(hprose.unserialize(hprose.serialize(undefined)) === null);
    console.assert(hprose.unserialize(hprose.serialize(null)) === null);
    console.assert(hprose.unserialize(hprose.serialize(function(){})) === null);
    console.assert(hprose.unserialize(hprose.serialize('')) === '');
    console.assert(hprose.unserialize(hprose.serialize('我')) === '我');
    console.assert(hprose.unserialize(hprose.serialize('#')) === '#');
    console.assert(hprose.unserialize(hprose.serialize('Hello')) === 'Hello');
    console.assert(hprose.unserialize(hprose.serialize('我爱你')) === '我爱你');
    console.assert(hprose.serialize(hprose.unserialize(hprose.serialize([]))).toString() === hprose.serialize([]).toString());
    console.assert(hprose.serialize(hprose.unserialize(hprose.serialize([1,2,3,4,5]))).toString() === hprose.serialize([1,2,3,4,5]).toString());
    console.assert(hprose.serialize(hprose.unserialize(hprose.serialize(['Tom', 'Jerry']))).toString() === hprose.serialize(['Tom', 'Jerry']).toString());
    console.assert(hprose.serialize(hprose.unserialize(hprose.serialize(['Tom', 'Tom']))).toString() === hprose.serialize(['Tom', 'Tom']).toString());
    var a = [];
    a[0] = a;
    console.assert(hprose.serialize(hprose.unserialize(hprose.serialize(a))).toString() === hprose.serialize(a).toString());
    var m = {};
    m.self = m;
    console.assert(hprose.serialize(hprose.unserialize(hprose.serialize(m))).toString() === hprose.serialize(m).toString());
    function User() {
        this.name = '';
        this.age = 0;
        this.self = null;
    }
    hprose.ClassManager.register(User, 'User');
    var user = new User();
    user.name = '张三';
    user.age = 28;
    user.self = user;
    console.assert(hprose.serialize(hprose.unserialize(hprose.serialize(user))).toString() === hprose.serialize(user).toString());
})();