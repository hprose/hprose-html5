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
 * ResultMode.js                                          *
 *                                                        *
 * hprose ResultMode for HTML5.                           *
 *                                                        *
 * LastModified: Sep 29, 2016                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global) {
    'use strict';

    global.hprose.ResultMode = {
        Normal: 0,
        Serialized: 1,
        Raw: 2,
        RawWithEndTag: 3
    };
    global.hprose.Normal        = global.hprose.ResultMode.Normal;
    global.hprose.Serialized    = global.hprose.ResultMode.Serialized;
    global.hprose.Raw           = global.hprose.ResultMode.Raw;
    global.hprose.RawWithEndTag = global.hprose.ResultMode.RawWithEndTag;

})(this || [eval][0]('this'));
