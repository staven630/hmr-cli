# [angular6-hmr](https://github.com/staven630/angular6-hmr.git)
&emsp;&emsp;提供angular6以上HMR(热更新)功能

## 步骤
1、进入angular项目父级目录内
> git clone https://github.com/staven630/angular6-hmr.git

&emsp;&emsp;angular6-hmr目录与angular项目(例如：my-app)是同级关系

2、执行gulp hmr --dir angular目录名
如：
> npm i
> gulp hmr --dir my-app

3、进入angular项目目录，安装@angularclass/hmr
> npm install --save-dev @angularclass/hmr --registry https://registry.npm.taobao.org

4、这样angular项目的HMR就配置完成了，执行
> npm run hmr

注：保持项目名(package.json中的name)与项目目录名一致


-------------
##### 以下为手动配置步骤
-------------
# Angular6添加HMR
### environments目录
environments.ts和environment.prod.ts增加hmr: false
```
export const environment = {
  hmr: false
};
```
复制environment新增environment.hmr.ts修改hmr:true
```
export const environment = {
  hmr: true
};
```
### .angular.json文件
build的configurations中添加
```
"hmr": {
  "fileReplacements": [
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.hmr.ts"
    }
  ]
}
```
serve的configurations中添加
```
"hmr": {
  "hmr": true,
  "browserTarget": "my-app:build:hmr"
}
```
### tsconfig.app.json的compilerOptions的types中添加
```
"types": ["node"]
```
### package.json的scripts中添加
```
"hmr": "ng serve --configuration hmr --open"
```
### 安装依赖
```
npm install --save-dev @angularclass/hmr
```
### src目录下创建hmr.ts
```
import { NgModuleRef, ApplicationRef } from '@angular/core';
import { createNewHosts } from '@angularclass/hmr';

export const hmrBootstrap = (module: any, bootstrap: () => Promise<NgModuleRef<any>>) => {
  let ngModule: NgModuleRef<any>;
  module.hot.accept();
  bootstrap().then(mod => ngModule = mod);
  module.hot.dispose(() => {
    const appRef: ApplicationRef = ngModule.injector.get(ApplicationRef);
    const elements = appRef.components.map(c => c.location.nativeElement);
    const makeVisible = createNewHosts(elements);
    ngModule.destroy();
    makeVisible();
  });
};
```
### 修改main.ts
```
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { hmrBootstrap } from './hmr';

if (environment.production) {
  enableProdMode();
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

if (environment.hmr) {
  if (module[ 'hot' ]) {
    hmrBootstrap(module, bootstrap);
  } else {
    console.error('HMR is not enabled for webpack-dev-server!');
    console.log('Are you using the --hmr flag for ng serve?');
  }
} else {
  bootstrap().catch(err => console.log(err));
}
```

# Angular5添加HMR
### environments目录
environments.ts和environment.prod.ts增加hmr: false
```
export const environment = {
  hmr: false
};
```
复制environment新增environment.hmr.ts修改hmr:true
```
export const environment = {
  hmr: true
};
```
### .angular-cli.json的environments中添加
```
"hmr": "environments/environment.hmr.ts"
```
### 在package.json的scripts中增加
```
"hmr": "ng serve --hmr -e=hmr --open"
```
### 安装依赖
```
npm install --save-dev @angularclass/hmr
```
### src目录下创建hmr.ts
```
import { NgModuleRef, ApplicationRef } from '@angular/core';
import { createNewHosts } from '@angularclass/hmr';

export const hmrBootstrap = (module: any, bootstrap: () => Promise<NgModuleRef<any>>) => {
  let ngModule: NgModuleRef<any>;
  module.hot.accept();
  bootstrap().then(mod => ngModule = mod);
  module.hot.dispose(() => {
    const appRef: ApplicationRef = ngModule.injector.get(ApplicationRef);
    const elements = appRef.components.map(c => c.location.nativeElement);
    const makeVisible = createNewHosts(elements);
    ngModule.destroy();
    makeVisible();
  });
};
```
### 修改main.ts
```
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { hmrBootstrap } from './hmr';

if (environment.production) {
  enableProdMode();
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

if (environment.hmr) {
  if (module[ 'hot' ]) {
    hmrBootstrap(module, bootstrap);
  } else {
    console.error('HMR is not enabled for webpack-dev-server!');
    console.log('Are you using the --hmr flag for ng serve?');
  }
} else {
  bootstrap().catch(err => console.log(err));
}
```