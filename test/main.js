require.config({
    paths: {
        hprose: '../dist/hprose-html5'
    }
});

require(['hprose'], function(hprose) {
    var client = new hprose.HttpClient("http://www.hprose.com/example/", ["hello"]);
    client.hello("World!", function(result) {
        alert(result);
    }, function(name, err) {
        alert(err);
    });
});