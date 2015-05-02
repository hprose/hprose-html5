# Hprose for HTML5

[![Join the chat at https://gitter.im/hprose/hprose-html5](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/hprose/hprose-html5?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

>---
- **[Introduction](#introduction)**
    - **[Browser support](#browser-support)**
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
