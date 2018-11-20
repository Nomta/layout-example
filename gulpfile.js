'use strict';
    
var gulp        = require('gulp'),
    cond        = require('gulp-cond'),
    sass        = require('gulp-sass'),
    csso        = require('gulp-csso'),
    pipe 		    = require('multipipe'),
    plumber     = require('gulp-plumber'),
    changed     = require('gulp-changed'),
    prefixer    = require('gulp-autoprefixer'),
    sourcemaps  = require('gulp-sourcemaps'),
    browserSync = require('browser-sync');
    
var sassOptions = {
  outputStyle: 'expanded'
};

var browserSyncOptions = {
  server: {
    baseDir: 'build/'
  },
  host: 'localhost',
  port: 9000
}

var paths = {
  css: {
    src: 'scss/**/*.scss',
    index: 'scss/main.scss',
    dist: 'css'
  },
  html: {
    src: '**/*.html',
    index: 'index.html',
    dist: ''
  },
  images: {
    src: 'assets/**/*',
    dist: 'images'
  },
  inputDir: 'src/',
  outputDir: 'build/'
}

var isDev = true;

gulp.task('build-css', function() {
  return gulp.src(paths.inputDir + paths.css.index)
    .pipe(plumber())
    .pipe(cond(
      isDev, 
      pipe(
        sourcemaps.init(),
        sass(sassOptions).on('error', sass.logError),
        sourcemaps.write('.')
      ), 
      pipe(
        sass().on('error', sass.logError),
        prefixer(),
        csso()
      )
    ))
    .pipe(gulp.dest(paths.outputDir + paths.css.dist))
});

// задержка, чтобы gulp-sass всегда корректно обновлял импортируемые файлы

gulp.task('delay-build-css', function() {
  setTimeout(function() {
    gulp.start('build-css')
  }, 300)
});

gulp.task('build-html', function() {
  gulp.src(paths.inputDir + paths.html.src)
  .pipe(gulp.dest(paths.outputDir + paths.html.dist))
});

gulp.task('build-images', function() {
		gulp.src(paths.inputDir + paths.images.src)
			.pipe(changed(paths.outputDir + paths.images.dist))
			.pipe(gulp.dest(paths.outputDir + paths.images.dist))
});

gulp.task('browser-sync', function() {
  browserSync(browserSyncOptions);
});

gulp.task('default', ['dev']);

gulp.task('dev', ['browser-sync', 'build'], function() {
	gulp.start('watch');
});

gulp.task('prod', function() {
	isDev = false;
	gulp.start('build');
});

gulp.task('build', ['build-css', 'build-html', 'build-images']);  

gulp.task('watch', function() {
	gulp.watch(paths.inputDir + paths.css.src, 	  ['delay-build-css']);
	gulp.watch(paths.inputDir + paths.html.src,   ['build-html']);
	gulp.watch(paths.inputDir + paths.images.src, ['build-images']);
	
	gulp.watch(paths.outputDir + '**/*').on('change',	browserSync.reload);
});

