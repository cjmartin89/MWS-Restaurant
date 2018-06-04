var gulp = require('gulp');
var del = require('del');
var imageResize = require('gulp-image-resize');
var rename = require('gulp-rename');

gulp.task('resize-images', () => {  
    const front_end_images =
        gulp.src('/Users/chrismartin/OneDrive/Udacity/Grow With Google/mws-restaurant-stage-1-master/img/*')

    del(['/Users/chrismartin/OneDrive/Udacity/Grow With Google/mws-restaurant-stage-1-master/img/*'])

    front_end_images
        .pipe(imageResize({
            width: 800,
            height: 600,
            crop: true,
            upscale: false
        }))
        .pipe(rename(function (path) {
            path.basename += '-large'
        }))
        .pipe(gulp.dest('/Users/chrismartin/OneDrive/Udacity/Grow With Google/mws-restaurant-stage-1-master/img'))

    front_end_images
        .pipe(imageResize({
            width: 600,
            height: 500,
            crop: true,
            upscale: false
        }))
        .pipe(rename(function (path) {
            path.basename += '-medium'
        }))
        .pipe(gulp.dest('/Users/chrismartin/OneDrive/Udacity/Grow With Google/mws-restaurant-stage-1-master/img/'))

    front_end_images
        .pipe(imageResize({
            width: 400,
            height: 300,
            crop: true,
            upscale: false
        }))
        .pipe(rename(function (path) {
            path.basename += '-small'
        }))
        .pipe(gulp.dest('/Users/chrismartin/OneDrive/Udacity/Grow With Google/mws-restaurant-stage-1-master/img'))
})

gulp.task('default', ['resize-images'])  