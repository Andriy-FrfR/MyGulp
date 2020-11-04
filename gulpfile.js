let project_folder = 'dist';
let source_folder = 'src';

let path = {
    build: {
        html: project_folder + '/',
        css: project_folder + '/css/',
        js: project_folder + '/js/',
        img: project_folder + '/img/',
        fonts: project_folder + '/fonts/'
    },
    src: {
        html: source_folder + '/*.html',
        css: source_folder + '/scss/index.scss',
        js: source_folder + '/js/index.js',
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
        fonts: source_folder + '/fonts/*.{ttf,otf,eot,woff,woff2,svg}'
    },
    watch: {
        html: source_folder + '/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
    },
    clean: './' + project_folder + '/'
}

let {src, dest} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    fileInclude = require('gulp-file-include'),
    del = require('del'),
    scss = require('gulp-sass'),
    autoPrefixer = require('gulp-autoprefixer'),
    groupMedia = require('gulp-group-css-media-queries'),
    cleanCss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default,
    imageMin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    webpHtml = require('gulp-webp-html'),
    webpCss = require('gulp-webpcss');

function browserSync() {
    browsersync.init({
        server: {
            baseDir: './' + project_folder + '/'
        },
        port: 3000,
        notify: false
    });
}

function html() {
    return src(path.src.html)
        .pipe( fileInclude() )
        .pipe( webpHtml() )
        .pipe( dest(path.build.html) )
        .pipe( browsersync.stream() )
}

function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: 'expanded'
            })
        )
        .pipe( groupMedia() )
        .pipe(
            autoPrefixer({
                overrideBrowserslist: ['last 5 versions'],
                cascade: true
            })
        )
        .pipe( webpCss() )
        .pipe( cleanCss() )
        .pipe( dest(path.build.css) )
        .pipe( browsersync.stream() )
}

function js() {
    return src(path.src.js)
        .pipe( fileInclude() )
        .pipe( uglify() )
        .pipe( dest(path.build.js) )
        .pipe( browsersync.stream() )
}

function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe( dest(path.build.img) )
        .pipe( src(path.src.img) )
        .pipe( 
            imageMin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlanced: true,
                optimizationLevel: 3 // 0 to 7
            })
        )
        .pipe( dest(path.build.img) )
        .pipe( browsersync.stream() )
}

function fonts() {
    return src(path.src.fonts)
        .pipe( dest(path.build.fonts) )
}

function clean() {
    return del(path.clean);
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;