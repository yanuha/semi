// Include Gulp
var     gulp            = require('gulp');
// All of your plugins
var     browserSync     = require('browser-sync');
var     reload          = browserSync.reload;
var     wiredep         = require('wiredep').stream;
var     plumber         = require('gulp-plumber');
var     uglify          = require('gulp-uglify');
var     notify          = require('gulp-notify');
var     del             = require('del');
var     useref          = require('gulp-useref');
var     compass         = require('gulp-compass');
var     autoprefixer    = require('gulp-autoprefixer');
var     csso            = require('gulp-csso');
var     cssnano         = require('gulp-cssnano');
var     jadeInheritance = require('gulp-jade-inheritance');
var     jade            = require('gulp-jade');
var     changed         = require('gulp-changed');
var     cached          = require('gulp-cached');
var     gulpif          = require('gulp-if');
var     filter          = require('gulp-filter');
var     imagemin        = require('gulp-imagemin');
var     pngquant        = require('imagemin-pngquant');

//Browser sync
gulp.task('browser-sync', function() {
    var files = [
        'app/**/*.html',
    ];
    browserSync.init(files, {
        server: {
            baseDir: "app",
            browser: 'google chrome'
        }
    });
});

// Clean
gulp.task('clean', function(cb) {
  del(['dist'], cb);
});

// Build
gulp.task('build', ['copym', 'copyico', 'fonts'], function () {
    return gulp.src('app/*.html')
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', cssnano()))
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});

gulp.task('copym', function () {
    return gulp.src(['app/img/**/*.{png,jpg,gif,svg}'])
        .pipe(imagemin({
            progressive: true,
            svgminPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/img'));
    gulp.src(['app/favicon/*.{png,ico}'])
        .pipe(gulp.dest('dist/favicon'));
    gulp.src(['app/img-backend/*.{png,jpg,gif,svg}'])
        .pipe(gulp.dest('dist/img-backend'));
});

// copyico
gulp.task('copyico', function () {
    return  gulp.src(['app/favicon/**/*'])
        .pipe(gulp.dest('dist/favicon'));
});

// Fonts
gulp.task('fonts', function() {
    return gulp.src([
        'app/fonts/**/*.{eot,svg,ttf,woff,woff2}',
        'app/bower_components/fontawesome/fonts/fontawesome-webfont.*'])
    .pipe(gulp.dest('dist/fonts/'));
});

// Bower
gulp.task('bower', function () {
  gulp.src('app/_head.jade')
    .pipe(wiredep({
      directory : "app/bower_components"
    }))
    .pipe(gulp.dest('app'))
    .pipe(notify({ message: 'Bower task complete' }));
});


// Compile HTML from Jade 2
gulp.task('jade', function() {
    var YOUR_LOCALS = {};
    return gulp.src('app/**/*.jade')
        .pipe(plumber(plumberErrorHandler))
        //only pass unchanged *main* files and *all* the partials
        .pipe(changed('app', {extension: '.html'}))

        //filter out unchanged partials, but it only works when watching
        .pipe(gulpif(global.isWatching, cached('jade')))

        //find files that depend on the files that have changed('app
        .pipe(jadeInheritance({basedir: 'app'}))

        //filter out partials (folders and files starting with "_" )
        .pipe(filter(function (file) {
            return !/\/_/.test(file.path) && !/^_/.test(file.relative);
        }))

        //process jade templates
        .pipe(jade({
            locals: YOUR_LOCALS,
            pretty: true
        }))

        //save all the files
        .pipe(gulp.dest('app'))
        .pipe(notify({ message: 'Your Jade file has been molded into HTML.' }));
});
gulp.task('setWatch', function() {
    global.isWatching = true;
});

// Compass
gulp.task('compass', function() {
  gulp.src('app/scss/**/*.scss')
    .pipe(plumber(plumberErrorHandler))
    .pipe(compass({
        css: 'app/css',
        sass: 'app/scss',
        img: 'app/img'
    }))
    .pipe(reload({stream:true}))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(gulp.dest('app/css'))
    .pipe(notify({ message: 'Compass task complete' }));
});


//the title and icon that will be used for the Grunt notifications
var notifyInfo = {
    title: 'Gulp'
};

//error notification settings for plumber
var plumberErrorHandler = { errorHandler: notify.onError({
        title: notifyInfo.title,
        icon: notifyInfo.icon,
        message: "Error: <%= error.message %>"
    })
};

gulp.task('watch', ['browser-sync', 'compass', 'setWatch', 'jade', 'bower'], function() {
    gulp.watch('app/scss/**/*.scss', ['compass'])
    gulp.watch('bower.json', ['bower'])
    gulp.watch('app/**/*.jade', ['setWatch', 'jade'])
});


// Default task to be run with `gulp`
gulp.task('default', ['watch'], function () {

});
