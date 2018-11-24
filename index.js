const path = require('path')
const colors = require('ansi-colors')
const fs = require('fs')
const log = require('fancy-log')
const ora = require('ora')
const program = require('commander');
const shell = require('shelljs');
const resolve  = (dir) => { return path.resolve(__dirname, dir) }
const output  = (dir) => { return path.resolve(process.cwd(), dir) }
const PACKAGE = require(output('./package.json'))
const spinner = ora('开始构建……');

program
  .version('0.1.0', '-v, --version')
  .option('i, init', 'init something');

program.parse(process.argv);

if (program.init) {
  spinner.start();
  writeEnvironment();
  spinner.succeed('写入环境配置成功!');
  writeConfig();
  writeTsConfig();
  writePackage(); 
} else {
  spinner.fail('无效的命令');
}

function readFile(src) {
  if (fs.existsSync(src)) {
    return fs.readFileSync(src, 'utf-8');
  } else {
    not_ng();
  }
}

function copyFile(src, dist) {
  if (fs.existsSync(src)) {
    fs.writeFileSync(dist, readFile(src));
  } else {
    not_ng();
  }
}

function not_ng() {
  log(colors.bold.red(`请确认是否是angular项目^V^`));
  process.exit(-1);
}

async function writeEnvironment() {
  ['environment.ts', 'environment.prod.ts', 'environment.hmr.ts'].forEach((filename) => {
    copyFile(resolve(`./tpl/${filename}`), output(`./src/environments/${filename}`));
  });
  ['hmr.ts', 'main.ts'].forEach((filename) => {
    copyFile(resolve(`./tpl/${filename}`), output(`./src/${filename}`));
  });
}

function writeConfig() {
  const NGJSON_PATH = output('./angular.json');
  let json = JSON.parse(readFile(NGJSON_PATH, 'utf-8'));
  let obj = json.projects[PACKAGE.name].architect;
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
    "browserTarget": `${PACKAGE.name}:build:hmr`
  }
  fs.writeFileSync(NGJSON_PATH, JSON.stringify(json, null, 2), 'utf8');
  spinner.succeed('写入angular.json成功!');
}

function writeTsConfig() {
  const TSCONFIG_PATH = output('./src/tsconfig.app.json');
  let json = JSON.parse(readFile(TSCONFIG_PATH));
  json.compilerOptions.types.push('node')
  fs.writeFileSync(TSCONFIG_PATH, JSON.stringify(json, null, 2), 'utf8');
  spinner.succeed('写入tsconfig.app.json成功!');
}

function writePackage() {
  const PACKAGE_PATH = output('./package.json');
  let json = JSON.parse(readFile(PACKAGE_PATH));
  json.scripts.hmr = "ng serve --configuration hmr --open"
  fs.writeFileSync(PACKAGE_PATH, JSON.stringify(json, null, 2), 'utf8');
  spinner.succeed('写入package.json成功!');
  spinner.succeed('开始安装@angularclass/hmr');
  shell.exec("npm install --save-dev @angularclass/hmr");
  spinner.succeed('安装@angularclass/hmr成功!');
  shell.exec("npm run hmr");
}
