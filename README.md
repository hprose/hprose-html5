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
- **[Introduction](#introduction)**
    - **[Browser support](#browser-support)**
    - **[Hybird app support](#hybird-app-support)**
- **[Usage](#usage)**
    - **[Exception Handling](#exception-handling)**

>---

## Introduction

*Hprose* is a High Performance Remote Object Service Engine.

It is a modern, lightweight, cross-language, cross-platform, object-oriented, high performance, remote dynamic communication middleware. It is not only easy to use, but powerful. You just need a little time to learn, then you can use it to easily construct cross language cross platform distributed application system.

*Hprose* supports many programming languages, for example:

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

Through *Hprose*, You can conveniently and efficiently intercommunicate between those programming languages.

This project is the implementation of Hprose for HTML5.

### Browser support

#### Desktop browsers

* Google Chrome 10+
* Apple Safari 6+
* Mozilla Firefox 9+
* Opera 12+
* Microsoft Internet Explorer 10.0+
* ...

#### Mobile browsers

* Apple Safari on iOS 6+
* Google Chrome on Android
* Default Browser on Android 4+
* Firefox Mobile
* Internet Explorer on Windows Phone
* ...

### Hybird app support

* ionic + cordova (http, tcp, websocket)
* Chrome extentions (http, tcp, websocket)
* APICloud (http, tcp*)
* DCloud (http)
* AppCan (http)
* ... (http, websocket)

TCP is only available on iOS for APICloud, because there is a bug of APICloud Android SDK, and they don't want to fix this bug.

## Usage

You don't need use the javascript source files. You only need include `hprose-html5.js` in your html.

### Exception Handling

If an error occurred on the server, or your service function/method throw an exception, it will be sent to the client. You need to pass an error callback function after succuss callback function to receive it. If you omit this callback function, the client will ignore the exception, like never happened.

For example:

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
