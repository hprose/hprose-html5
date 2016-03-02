var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    jshint = require("gulp-jshint"),
    lzmajs = require("gulp-lzmajs"),
    del = require('del');

gulp.task('clear', function(){
    del(['dist/hprose-html5.js']);
});

gulp.task('uglify', ['clear'], function() {
    return gulp.src(['src/Init.js',
                     'src/Helper.js',
                     'src/HarmonyMaps.js',
                     'src/TimeoutError.js',
                     'src/setImmediate.js',
                     'src/Future.js',
                     'src/BytesIO.js',
                     'src/Tags.js',
                     'src/ClassManager.js',
                     'src/Writer.js',
                     'src/Reader.js',
                     'src/Formatter.js',
                     'src/ResultMode.js',
                     'src/Client.js',
                     'src/HttpClient.js',
                     'src/TcpClient.js',
                     'src/WebSocketClient.js',
                     'src/JSONRPCClientFilter.js',
                     'src/Loader.js'])
        .pipe(jshint())
        .pipe(jshint.reporter())
        .pipe(concat('hprose-html5.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('compress', ['uglify'], function() {
    return gulp.src(['dist/hprose-html5.js'])
           .pipe(concat('hprose-html5.min.js'))
           .pipe(lzmajs())
           .pipe(gulp.dest('dist'));
});

gulp.task('default', ['compress'], function() {
    return gulp.src(['src/CopyRight.js', 'dist/hprose-html5.js'])
           .pipe(concat('hprose-html5.js'))
           .pipe(gulp.dest('dist'));
});
