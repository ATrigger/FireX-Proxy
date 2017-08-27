const gulp       = require('gulp'),
      concat     = require('gulp-concat'),
      sass       = require('gulp-sass'),
      babel      = require('gulp-babel'),
      ngAnnotate = require('gulp-ng-annotate');

gulp.task('sass', () => {
    gulp
        .src([
            './data/sass/**/*.scss'
        ])
        .pipe(sass())
        .pipe(gulp.dest('./data/build'));
});

gulp.task('babel', () => {
    gulp
        .src('./data/js/**/*.js')
        .pipe(babel())
        .pipe(concat('build.js'))
        .pipe(ngAnnotate())
        .pipe(gulp.dest('./data/build'));
});

gulp.task('default', [
    'babel',
    'sass'
]);