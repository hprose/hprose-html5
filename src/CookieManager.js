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
 * CookieManager.js                                       *
 *                                                        *
 * hprose CookieManager for HTML5.                        *
 *                                                        *
 * LastModified: Dec 2, 2016                              *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (hprose) {
    'use strict';

    var parseuri = hprose.parseuri;

    var s_cookieManager = {};

    function setCookie(headers, uri) {
        var parser = parseuri(uri);
        var host = parser.host;
        var name, values;
        function _setCookie(value) {
            var cookies, cookie, i;
            cookies = value.replace(/(^\s*)|(\s*$)/g, '').split(';');
            cookie = {};
            value = cookies[0].replace(/(^\s*)|(\s*$)/g, '').split('=', 2);
            if (value[1] === undefined) { value[1] = null; }
            cookie.name = value[0];
            cookie.value = value[1];
            for (i = 1; i < cookies.length; i++) {
                value = cookies[i].replace(/(^\s*)|(\s*$)/g, '').split('=', 2);
                if (value[1] === undefined) { value[1] = null; }
                cookie[value[0].toUpperCase()] = value[1];
            }
            // Tomcat can return SetCookie2 with path wrapped in "
            if (cookie.PATH) {
                if (cookie.PATH.charAt(0) === '"') {
                    cookie.PATH = cookie.PATH.substr(1);
                }
                if (cookie.PATH.charAt(cookie.PATH.length - 1) === '"') {
                    cookie.PATH = cookie.PATH.substr(0, cookie.PATH.length - 1);
                }
            }
            else {
                cookie.PATH = '/';
            }
            if (cookie.EXPIRES) {
                cookie.EXPIRES = Date.parse(cookie.EXPIRES);
            }
            if (cookie.DOMAIN) {
                cookie.DOMAIN = cookie.DOMAIN.toLowerCase();
            }
            else {
                cookie.DOMAIN = host;
            }
            cookie.SECURE = (cookie.SECURE !== undefined);
            if (s_cookieManager[cookie.DOMAIN] === undefined) {
                s_cookieManager[cookie.DOMAIN] = {};
            }
            s_cookieManager[cookie.DOMAIN][cookie.name] = cookie;
        }
        for (name in headers) {
            values = headers[name];
            name = name.toLowerCase();
            if ((name === 'set-cookie') || (name === 'set-cookie2')) {
                if (typeof(values) === 'string') {
                    values = [values];
                }
                values.forEach(_setCookie);
            }
        }
    }

    function getCookie(uri) {
        var parser = parseuri(uri);
        var host = parser.host;
        var path = parser.path;
        var secure = (parser.protocol === 'https:');
        var cookies = [];
        for (var domain in s_cookieManager) {
            if (host.indexOf(domain) > -1) {
                var names = [];
                for (var name in s_cookieManager[domain]) {
                    var cookie = s_cookieManager[domain][name];
                    if (cookie.EXPIRES && ((new Date()).getTime() > cookie.EXPIRES)) {
                        names.push(name);
                    }
                    else if (path.indexOf(cookie.PATH) === 0) {
                        if (((secure && cookie.SECURE) ||
                            !cookie.SECURE) && (cookie.value !== null)) {
                            cookies.push(cookie.name + '=' + cookie.value);
                        }
                    }
                }
                for (var i in names) {
                    delete s_cookieManager[domain][names[i]];
                }
            }
        }
        if (cookies.length > 0) {
            return cookies.join('; ');
        }
        return '';
    }

    hprose.cookieManager = {
        setCookie: setCookie,
        getCookie: getCookie
    };
})(hprose);
