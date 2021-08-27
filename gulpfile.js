
let project_folder = "dist";
let sourse_folder = "src";

let fs = require('fs');

let path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/images/",
    fonts: project_folder + "/fonts/",
  },
  src: {
    html: [sourse_folder + "/*.html", "!" + sourse_folder + "/_*.html"],
    css: sourse_folder + "/postcss/style.pcss",
    js: sourse_folder + "/js/script.js",
    img: sourse_folder + "/images/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: sourse_folder + "/fonts/*.ttf",
  },
  watch: {
    html: sourse_folder + "/**/*.html",
    css: sourse_folder + "/postcss/**/*.pcss",
    js: sourse_folder + "/js/**/*.js",
    img: sourse_folder + "/images/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  clean: "./" + project_folder + "/"
}

let { src, dest } = require('gulp'),
  gulp = require('gulp'),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  del = require("del"),
  postcss = require("gulp-postcss"),
  rename = require('gulp-rename'),
  autoprefixer = require('gulp-autoprefixer'),
  media_queries = require('gulp-group-css-media-queries'),
  clean_css = require('gulp-clean-css'),
  uglify_es = require('gulp-uglify-es').default,
  babel = require('gulp-babel'),
  webp = require('gulp-webp'),
  webp_html = require('gulp-webp-html'),
  webpcss = require('gulp-webpcss'),
  ttf2woff = require('gulp-ttf2woff'),
  ttf2woff2 = require('gulp-ttf2woff2'),
  fonter = require('gulp-fonter');

function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false
  })
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webp_html())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function css() {
  return src(path.src.css)
    .pipe(postcss())
    .pipe(rename({
      extname: '.css'
    }))
    
    .pipe(
      media_queries()
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
      })
    )
    .pipe(webpcss())
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(dest(path.build.js))
    .pipe(
      uglify_es()
    )
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
    
}

function images() {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 70
      })
    )
    .pipe(src(path.src.img))
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

function fonts(params) {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts))
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))
}

gulp.task('otf2ttf', function () {
  return src([sourse_folder + '/fonts/*.otf'])
    .pipe(fonter({
      formats: ['ttf']
    }))
    .pipe(dest(sourse_folder + '/fonts/'))
})

// function fontsStyle(params) {
//   let file_content = fs.readFileSync(source_folder + '/postcss/fonts.pcss');
//   if (file_content == '') {
//     fs.writeFile(source_folder + '/postcss/fonts.pcss', '', cb);
//     return fs.readdir(path.build.fonts, function (err, items) {
//     if (items) {
//       let c_fontname;
//       for (var i = 0; i < items.length; i++) {
//         let fontname = items[i].split('.');
//         fontname = fontname[0];
//         if (c_fontname != fontname) {
//           fs.appendFile(source_folder + '/postcss/fonts.pcss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
//         }
//         c_fontname = fontname;
//       }
//     }
//     })
//   }
// }
  
//   function cb() { }

function watchFiles(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

function clean(params) {
  return del(path.clean);
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