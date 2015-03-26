var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('default', function() {
    return browserify(__dirname + '/web')
        .bundle()
        .pipe(source('firth.js'))
        .pipe(gulp.dest(__dirname));
});
