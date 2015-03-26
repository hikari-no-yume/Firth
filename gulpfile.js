const argv = require('yargs')
    .options('config', {
        alias: 'c',
        default: require('fs').existsSync('/app/config/gulp.json') ? '/app/config/gulp.json' : undefined,
        describe: 'Config file'
    })
    .options('sourcemaps', {
        alias: 'sm',
        describe: 'Add sourcemaps to compiled Javascript & CSS files',
        default: false
    })
    .options('minify', {
        alias: 'm',
        describe: 'Minify Javascript & CSS files',
        default: false
    })
    .options('watch', {
        alias: 'w',
        describe: 'Watch files for changes',
        default: false
    })
    .options('help', {
        alias: 'h'
    })
    .help('help')
    .config('config')
    .argv;

const util = require('util');
const gulp = require('gulp');
const plugin = require('gulp-load-plugins')();
const uglify = argv.minify ? plugin.uglify : plugin.util.noop;
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const prettyHrtime = require('pretty-hrtime');
console.log(uglify);
const src = __dirname + '/src/';
const dist = __dirname + '/dist/';

const sourcemaps = argv.sourcemaps ? require('gulp-sourcemaps') : {
    init: plugin.util.noop,
    write: plugin.util.noop
};

const watchify = argv.watch ? function(file, opts) {
    return require('watchify')(
        browserify(
            file,
            util._extend(opts, watchify.args)
        )
    );
} : browserify;

const buildJs = function(input, dest, output, config) {
    const bundler = watchify(input, config);

    const bundle = function () {
        const startTime = process.hrtime();
        return bundler.bundle()
            .on('error', function(error) {
                plugin.util.log(error.message);
            })
            .pipe(source(output))
            .pipe(argv.sourcemaps ? buffer() : plugin.util.noop())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(dest))
            .on('end', function() {
                const taskTime = process.hrtime(startTime);
                const prettyTime = prettyHrtime(taskTime);
                plugin.util.log('Bundled', plugin.util.colors.green(output), 'in', plugin.util.colors.magenta(prettyTime));
            });
    };

    bundler.on('update', bundle);

    return bundle();
};

gulp.task('lib', function() {
    return buildJs(src, dist, 'firth.js', {
        debug: argv.sourcemaps
    });
});

gulp.task('web', function() {
    return buildJs(src + 'web', dist, 'firth.web.js', {
        debug: argv.sourcemaps
    });
});

gulp.task('default', ['lib', 'web']);
