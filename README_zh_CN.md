<p align="center"><img src="http://hprose.com/banner.@2x.png" alt="Hprose" title="Hprose" width="650" height="200" /></p>

<a href="https://promisesaplus.com/">
    <img src="https://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo" title="Promises/A+ 1.1 compliant" align="right" />
</a>

# Hprose for HTML5

[![Join the chat at https://gitter.im/hprose/hprose-html5](https://img.shields.io/badge/GITTER-join%20chat-green.svg)](https://gitter.im/hprose/hprose-html5?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![bower version](https://img.shields.io/bower/v/hprose-html5.svg)](http://bower.io/search/?q=hprose-html5)
[![npm version](https://img.shields.io/npm/v/hprose-html5.svg)](https://www.npmjs.com/package/hprose-html5)
[![GitHub release](https://img.shields.io/github/release/hprose/hprose-html5.svg)](https://github.com/hprose/hprose-html5/releases)
[![License](https://img.shields.io/github/license/hprose/hprose-html5.svg)](http://opensource.org/licenses/MIT)

>---
- **[简介](#简介)**
    - **[浏览器支持](#浏览器支持)**
    - **[混合应用支持](#混合应用支持)**
- **[使用](#使用)**
    - **[异常处理](#异常处理)**

>---

## 简介

*Hprose* 是高性能远程对象服务引擎（High Performance Remote Object Service Engine）的缩写。

它是一个先进的轻量级的跨语言跨平台面向对象的高性能远程动态通讯中间件。它不仅简单易用，而且功能强大。你只需要稍许的时间去学习，就能用它轻松构建跨语言跨平台的分布式应用系统了。

*Hprose* 支持众多编程语言，例如：

* AAuto Quicker
* ActionScript
* ASP
* C++
* Dart
* Delphi/Free Pascal
* dotNET(C#, Visual Basic...)
* Golang
* Java
* JavaScript
* Node.js
* Objective-C
* Perl
* PHP
* Python
* Ruby
* ...

通过 *Hprose*，你就可以在这些语言之间方便高效的实现互通了。

本项目是 Hprose 的 HTML5 版本实现。

### 浏览器支持

#### 桌面浏览器

* Google Chrome 10+
* Apple Safari 6+
* Mozilla Firefox 9+
* Opera 12+
* Microsoft Internet Explorer 10.0+
* ...

#### 移动浏览器

* Apple Safari on iOS 6+
* Google Chrome on Android
* Default Browser on Android 4+
* Firefox Mobile
* Internet Explorer on Windows Phone
* ...

### 混合应用支持

* ionic + cordova (http, tcp, websocket)
* Chrome extentions (http, tcp, websocket)
* APICloud (http, tcp*)
* DCloud (http)
* AppCan (http)
* ... (http, websocket)

在 APICloud 平台上，TCP 只在 iOS 上有效，因为 APICloud 的 Android SDK 有个 bug，但是他们不肯修复，所以我也无能为力。

## 使用

你不需要使用 javascript 的源文件，你只需要在你的 html 中包含 `hprose-html5.js` 就够了。

### 异常处理

如果服务器端发生错误，或者你的服务函数或方法抛出了异常，它将被发送到客户端。你可以在成功回调函数后面传入错误回调函数来接收它。如果你忽略该回调函数，客户端将忽略该异常，就像从来没发生过一样。

例如：

```html
<html>
<head>
<script type="text/javascript" src="hprose-html5.js"></script>
</head>
<body>
<script type="text/javascript">
    var client = new hprose.HttpClient("http://www.hprose.com/example/", ["hello"]);
    client.hello("World!", function(result) {
        alert(result);
    }, function(name, err) {
        alert(err);
    });
</script>
</body>
```

更多详细文档请参见：[Hprose for HTML5 用户手册](https://github.com/hprose/hprose-html5/wiki)
