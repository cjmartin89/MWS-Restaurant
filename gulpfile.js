// gulpfile.js
var gulp = require('gulp');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var del = require('del');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var uglify = require('gulp-uglify-es').default;
var pump = require('pump');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');

gulp.task('scripts-sw', () => {
  browserify('sw.bak.js')
  .transform(babelify)
  .bundle()
  .pipe(source('./sw.js'))
  .pipe(gulp.dest('./'))
});

gulp.task('scripts-idb', () => {
  browserify('js/indexeddb.js')
  .transform(babelify)
  .bundle()
  .pipe(source('js/bundledidb.js'))
  .pipe(gulp.dest('./'))
});

gulp.task('uglify', function () {
  return gulp.src('./js/bundledidb.js')
      .pipe(rename("bundle.min.js"))
      .pipe(uglify())
      .pipe(gulp.dest("dist/js"));
});

gulp.task('clean', () => {
  return del(['sw.js', 'js/bundledidb.js']);
});

gulp.task('minify-css', () => {
  return gulp.src('css/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('stream', function () {
  // Endless stream mode
  watch(['./sw.bak.js','./js/indexeddb.js', './js/main.js'], { ignoreInitial: false }, batch(function (events, done) {
    gulp.start(['clean', 'scripts-idb', 'scripts-sw'], done);
  }))
});

gulp.task('default', ['stream', 'uglify', 'minify-css']);