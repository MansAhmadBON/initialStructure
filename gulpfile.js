const gulp = require('gulp');
const {src, dest} = require(`gulp`);

const browsersync = require('browser-sync').create();
const fileInclude = require('gulp-file-include');
const del = require('del');
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fonter = require('gulp-fonter');

const projectFolder = 'dist';
const sourceFolder = 'src';


const path = {
    build: {
        html: `${projectFolder}/`,
        css: `${projectFolder}/css/`,
        js: `${projectFolder}/js/`,
        img: `${projectFolder}/assets/img/`,
        fonts: `${projectFolder}/assets/fonts/`
    },
    src: {
        html: [`${sourceFolder}/*.html`, '!' + sourceFolder + '/_*.html'],
        css: `${sourceFolder}/scss/style.scss`,
        js: `${sourceFolder}/js/index.js`,
        img: `${sourceFolder}/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}`,
        fonts: `${sourceFolder}/fonts/*.ttf`
    },
    watch: {
        html: `${sourceFolder}/**/*.html`,
        css: `${sourceFolder}/scss/**/*.scss`,
        js: `${sourceFolder}/js/**/*.js`,
        img: `${sourceFolder}/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}`,
    },
    clean: `./${projectFolder}/`
};



function browserSync(){
    browsersync.init({
        server: {
            baseDir:  `./${projectFolder}/`,
        },
        port: 3030,
        notify: false
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileInclude())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(scss({
            outputStyle: 'expanded'
        }))
        .pipe(gcmq())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 5 version'],
            cascade: true
        }))
        .pipe(dest(path.build.css))
        .pipe(cleanCSS())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
        .pipe(fileInclude())
        .pipe(dest(path.build.js))
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(uglify())
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function images() {
    return src(path.src.img)
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 3
        }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
}


gulp.task('otf2ttf', function () {
    return src(`${sourceFolder}/fonts/*.otf`)
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest(`${sourceFolder}/fonts/`))
});

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

function clean() {
    return del(path.clean)
}

const build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts));
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;

//enter the 'gulp' command to start development