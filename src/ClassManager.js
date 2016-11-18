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
 * ClassManager.js                                        *
 *                                                        *
 * hprose ClassManager for HTML5.                         *
 *                                                        *
 * LastModified: Nov 18, 2016                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (hprose, global) {
    'use strict';

    var WeakMap = global.WeakMap;

    var classCache = Object.create(null);
    var aliasCache = new WeakMap();

    function register(cls, alias) {
        aliasCache.set(cls, alias);
        classCache[alias] = cls;
    }

    function getClassAlias(cls) {
        return aliasCache.get(cls);
    }

    function getClass(alias) {
        return classCache[alias];
    }

    hprose.ClassManager = Object.create(null, {
        register: { value: register },
        getClassAlias: { value: getClassAlias },
        getClass: { value: getClass }
    });

    hprose.register = register;

    register(Object, 'Object');

})(hprose, hprose.global);
