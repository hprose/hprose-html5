var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    jshint = require("gulp-jshint"),
    del = require('del');

gulp.task('clear', function(){
    del(['dist/hprose-html5.js']);
});

gulp.task('compress', ['clear'], function() {
    return gulp.src(['src/Init.js',
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
                     'src/WebSocketClient.js',
                     'src/JSONRPCClientFilter.js',
                     'src/Loader.js'])
        .pipe(jshint())
        .pipe(jshint.reporter())
        .pipe(concat('hprose-html5.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['compress'], function() {
    return gulp.src(['src/CopyRight.js', 'dist/hprose-html5.js'])
           .pipe(concat('hprose-html5.js'))
           .pipe(gulp.dest('dist'));
});
