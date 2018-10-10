
const gulp = require('gulp')
const path = require('path')
const fs = require('fs')
const runSequence = require('run-sequence')
const argv = require('minimist')(process.argv.slice(2))
const colors = require('ansi-colors')
const log = require('fancy-log')
const DIR_PATH = argv.dir
const ROOT_PATH = path.resolve(__dirname, `../${DIR_PATH}`)
const SRC_PATH = `${ROOT_PATH}/src`
const ENV_PATH = `${SRC_PATH}/environments`
const TPL_PATH = path.resolve(__dirname, './tpl')
const CONFIG = {
  angular: `${ROOT_PATH}/angular.json`,
  tsconfig: `${SRC_PATH}/tsconfig.app.json`,
  package: `${ROOT_PATH}/package.json`
}


const fsExistsSync = (path) => {
  try {
    fs.accessSync(path, fs.constants.W_OK | fs.constants.R_OK);
  } catch (e) {
    return false;
  }
  return true;
};

gulp.task('envs', () => {
  gulp.src(`${TPL_PATH}/environments/**.*ts`)
    .pipe(gulp.dest(`${ENV_PATH}/`))
});

gulp.task('addhmr', () => {
  gulp.src(`${TPL_PATH}/src/**.*ts`)
    .pipe(gulp.dest(`${SRC_PATH}/`))
});

gulp.task('configs', () => {
  let json = JSON.parse(fs.readFileSync(CONFIG.angular, 'utf-8'));
  let obj = json.projects[DIR_PATH].architect;
  obj.build.configurations.hmr = {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.hmr.ts"
      }
    ]
  }
  obj.serve.configurations.hmr = {
    "hmr": true,
    "browserTarget": `${DIR_PATH}:build:hmr`
  }
  fs.writeFileSync(CONFIG.angular, JSON.stringify(json, null, 2), 'utf8');
})

gulp.task('tsconfig', () => {
  let json = JSON.parse(fs.readFileSync(CONFIG.tsconfig, 'utf-8'));
  json.compilerOptions.types.push('node')
  fs.writeFileSync(CONFIG.tsconfig, JSON.stringify(json, null, 2), 'utf8');
})

gulp.task('mdpackage', () => {
  let json = JSON.parse(fs.readFileSync(CONFIG.package, 'utf-8'));
  json.scripts.hmr = "ng serve --configuration hmr --open"
  fs.writeFileSync(CONFIG.package, JSON.stringify(json, null, 2), 'utf8');
})

gulp.task('hmr', () => {
  if (DIR_PATH && fsExistsSync(ROOT_PATH)) {
    runSequence('envs', 'configs', 'tsconfig', 'mdpackage', 'addhmr')
  } else {
    log(colors.bold.red(`${DIR_PATH}目录不存在`))
  }
});