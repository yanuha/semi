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
var     spritesmith     = require('gulp.spritesmith');
var     sass            = require('gulp-sass');
var     sassGlob        = require('gulp-sass-glob');
var     autoprefixer    = require('gulp-autoprefixer');
var     csso            = require('gulp-csso');
var     cssnano         = require('gulp-cssnano');
var     pugInheritance  = require('gulp-pug-inheritance');
var     pug             = require('gulp-pug');
var     jadeInheritance  = require('gulp-jade-inheritance');
var     jade             = require('gulp-jade');
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
gulp.task('build', ['copym', 'copyBackend', 'copyFavicon', 'fonts'], function () {
    return gulp.src('app/*.html')
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', cssnano()))
        .pipe(gulp.dest('dist'));
});

// copy content

gulp.task('copym', function () {
    return gulp.src(['app/img/**/*.{png,jpg,gif,svg}'])
        .pipe(imagemin({
            progressive: true,
            svgminPlugins: [{removeViewBox: true}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('copyBackend', function () {
    return gulp.src(['app/img-backend/*.{png,jpg,gif,svg}'])
        .pipe(imagemin({
            progressive: true,
            svgminPlugins: [{removeViewBox: true}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/img-backend'));
});

gulp.task('copyFavicon', function () {
    return gulp.src(['app/favicon/*.{png,ico}'])
        .pipe(gulp.dest('dist/favicon'));
});

// Sprite

gulp.task('sprite', function() {
    var spriteData = 
        gulp.src('app/img/sprite/*.*')
            .pipe(plumber(plumberErrorHandler))
            .pipe(spritesmith({
                retinaSrcFilter: 'app/img/sprite/*@2x.png',
                retinaImgName: '../img/sprite-map@2x.png',
                imgName: '../img/sprite-map.png',
                cssName: '_sprite.scss',
                algorithm: 'diagonal',
                padding: 2,
                cssVarMap: function(sprite) {
                    sprite.name = 'sprite-' + sprite.name
                }
            }));

    spriteData.img.pipe(gulp.dest('app/img/'));
    spriteData.css.pipe(gulp.dest('app/scss/helpers/'));
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


// PUG
gulp.task('jade', function() {
    return gulp.src('app/**/*.jade')

    //only pass unchanged *main* files and *all* the partials 
    .pipe(changed('app', { extension: '.html' }))

    //filter out unchanged partials, but it only works when watching 
    .pipe(gulpif(global.isWatching, cached('jade')))

    //find files that depend on the files that have changed 
    .pipe(jadeInheritance({ basedir: 'app', skip: 'node_modules' }))

    //filter out partials (folders and files starting with "_" ) 
    .pipe(filter(function(file) {
      return !/\/_/.test(file.path) && !/^_/.test(file.relative);
    }))
    .pipe(plumber())
    .pipe(jade({
        pretty: true
    }))
    .on("error", notify.onError(function(error) {
      return "Message to the notifier: " + error.message;
    }))
    .pipe(gulp.dest('app'));
});
gulp.task('setWatch', function() {
    global.isWatching = true;
});


// style
gulp.task('style', function() {
  gulp.src('app/scss/**/*.scss')
    .pipe(plumber(plumberErrorHandler))
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(reload({stream:true}))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(gulp.dest('app/css'))
    .pipe(notify({ message: 'Style task complete' }));
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

gulp.task('watch', ['browser-sync', 'sprite', 'style', 'setWatch', 'jade', 'bower'], function() {
    gulp.watch('app/scss/**/*.scss', ['style'])
    gulp.watch('bower.json', ['bower'])
    gulp.watch('app/**/*.jade', ['setWatch', 'jade'])
});


// Default task to be run with `gulp`
gulp.task('default', ['watch']);
