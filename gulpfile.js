'use strict';


let gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    mocha = require('gulp-mocha'),
    gutil = require('gulp-util');

gulp.task('default', function(){
  nodemon({
      script: 'index.js', //what to look for in terms of changes
      ext: 'js',
      env: {PORT: 3000}, //we can scpecify this env variables like port
      ignore: ['./node_modules/**']
    }).on('restart', () => console.log("Gulp - Restarting server.."));  
});

gulp.task('mocha', function() {
    //run files inside 'test/', send the output to a reporter
    //and execute the log function if the 'error' event is raised
    return gulp.src(['test/*.js'], { read: false })
        .pipe(mocha({ reporter: 'list' }))
        .on('error', gutil.log);
});

gulp.task('watch-mocha', function() {
    gulp.run('mocha')
    gulp.watch(['lib/**', 'test/**'], ['mocha']);
});
