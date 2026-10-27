# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.1.1](https://github.com/star-ss-qaq/star-node-framework/compare/@thestarweb/star-framework-cli@1.1.0...@thestarweb/star-framework-cli@1.1.1) (2026-10-27)


### Bug Fixes

* **cli:** 修复resolve参数没有正确透传 ([8a8c7d6](https://github.com/star-ss-qaq/star-node-framework/commit/8a8c7d6fbc56c2a7b6b23c220952cb2649bbfd8a))





# [1.1.0](https://github.com/star-ss-qaq/star-node-framework/compare/@thestarweb/star-framework-cli@1.0.0...@thestarweb/star-framework-cli@1.1.0) (2026-10-27)


### Features

* **cli:** 增加define和resolve透传 ([d9905dc](https://github.com/star-ss-qaq/star-node-framework/commit/d9905dcf66e3def4a4cd766e5a48e42f88ea7660))





# 1.0.0 (2026-10-22)


### Bug Fixes

* 临时解决服务器开发调试阶段的问题 ([0d46e55](https://github.com/star-ss-qaq/star-node-framework/commit/0d46e557e550e9d547b79ffefc7c6509d5334b83))
* 修复cli命令不能正确启动的问题 ([dcb522e](https://github.com/star-ss-qaq/star-node-framework/commit/dcb522e396425ca921cb9ba3afce46487a905e9f))
* **cli:** 解决打包及副作用问题 ([ab3216a](https://github.com/star-ss-qaq/star-node-framework/commit/ab3216a1bcdf33a6c3fdd39bac53711d01f5a302))
* **cli:** 解决实际开发预编译时系统模块sideOnly注释不生效导致前端处理失败的问题 ([e3924ac](https://github.com/star-ss-qaq/star-node-framework/commit/e3924ac2119a58544624322547a2b2e3e9a106f5))
* **cli:** 修复非js/ts文件也会被处理的问题 ([14bd050](https://github.com/star-ss-qaq/star-node-framework/commit/14bd05099a0f7e350be141c7788865a334376818))
* **cli:** 修复build时绝对路径仍然被额外拼接路径的问题 ([d301673](https://github.com/star-ss-qaq/star-node-framework/commit/d301673b3a05f17cb5ec03860ed4ba1e2bfa85a7))
* **cli:** 修复deepkit只有在ts中才能工作 ([9cf2326](https://github.com/star-ss-qaq/star-node-framework/commit/9cf23260a13932da7c0c7f1ee1b59d76ace1427d))
* **cli:** 修复ts转换插件执行时机不正确导致转换失败 ([531d8c6](https://github.com/star-ss-qaq/star-node-framework/commit/531d8c617f455dd3e3b2acab21d47ba02c2fec24))
* **cli:** 用户配置文件不存在时不报错，但是存在但有错误时需要报错 ([cfa6cec](https://github.com/star-ss-qaq/star-node-framework/commit/cfa6cec22cda855bdcaa5d7919b4202dd7f09f12))
* **cli:** 优化sideonly执行范围 ([018054d](https://github.com/star-ss-qaq/star-node-framework/commit/018054d6a7fa1ef8aa1d72b72ea8dfdb2dc7e533))
* **cli:** dev模式在用户代码错误时不要退出 ([74355ab](https://github.com/star-ss-qaq/star-node-framework/commit/74355ab98bc5e2477b7135922081dbb4e515fe78))
* **ts-helper:** 调整visiter格式 ([d2fadf3](https://github.com/star-ss-qaq/star-node-framework/commit/d2fadf378e52611dcf552c24e64944e6ae0d960e))


### Features

* 调整修饰器规则以便将更多内容规则化 ([50f4b82](https://github.com/star-ss-qaq/star-node-framework/commit/50f4b82f668d8d6fe26b7e2ca00113863a3e99a4))
* 发布准备 ([2e4f171](https://github.com/star-ss-qaq/star-node-framework/commit/2e4f17163dca5e2fee8312825f1483e464ffa1f0))
* 解决编译问题 ([341ae39](https://github.com/star-ss-qaq/star-node-framework/commit/341ae39d3f028bb1dd6f61dc04469e34c414fd1e))
* **apo-web:** 将运行环境与编译等环境分开，确保服务端只需安装最基础代码，其余代码由项目提供 ([158386f](https://github.com/star-ss-qaq/star-node-framework/commit/158386fdf22e19ad02dafa362bf004c6e3773aa1))
* **cli&app-web:** 更新规则 ([24a99df](https://github.com/star-ss-qaq/star-node-framework/commit/24a99dfab4a5a57ccbc776e231546db0b2a36eda))
* **cli&app-web:** 增加修饰器规则 将接口代码从前端移除 ([d5633ca](https://github.com/star-ss-qaq/star-node-framework/commit/d5633caeb6218db7f96fcf56b6b09cd8d4fb761c))
* **cli&app-web:** dev命令的应用实例创建现在交给cli ([7d2c409](https://github.com/star-ss-qaq/star-node-framework/commit/7d2c409e7f66f2e28ed460e79f55ca063ec43b1e))
* **cli&web:** 支持web程序dev命令 ([f4f25b6](https://github.com/star-ss-qaq/star-node-framework/commit/f4f25b611ec3865091b7ae16c29422fe01646fca))
* **cli:** 调整dev插件钩子名称 ([349fc7b](https://github.com/star-ss-qaq/star-node-framework/commit/349fc7bb1879024bd4b9b5d4da4494b9290926c5))
* **cli:** 完成环境分隔和side获取等基本配置 ([722e4c9](https://github.com/star-ss-qaq/star-node-framework/commit/722e4c96199db00143f1ac02af46814f6d192fc7))
* **cli:** 现在使用ts-helper的Scope能力检测变量的导入 ([3c75832](https://github.com/star-ss-qaq/star-node-framework/commit/3c75832ab2f3505151525caef63e88b405158c54))
* **cli:** 增加注释版本side-only的注释版本并默认启用插件 ([7f694f5](https://github.com/star-ss-qaq/star-node-framework/commit/7f694f5cf81673b387bc44aef173587784ec3479))
* **cli:** 增加自动di支持 ([bbf23e9](https://github.com/star-ss-qaq/star-node-framework/commit/bbf23e9da7a935c162636ca4bb4dd25bcf6c2147))
* **cli:** 支持编译项目 ([ac6de0a](https://github.com/star-ss-qaq/star-node-framework/commit/ac6de0afa3c377426be3770144e2a595cac380dd))
* **cli:** 支持配置文件添加vite插件 ([2a6b8e7](https://github.com/star-ss-qaq/star-node-framework/commit/2a6b8e74ef4df9110b513bb4a6ed911ff7635ba3))
* **cli:** sideOnly完全配置化 ([6f2fa97](https://github.com/star-ss-qaq/star-node-framework/commit/6f2fa976409db33145b501681b37faa41ced91af))
* TS SideOnly功能 ([e2c64ed](https://github.com/star-ss-qaq/star-node-framework/commit/e2c64ed3829628b03286806bf7dd54367a7ea0c1))
* **web:** 初步打通浏览器加载 ([c49c468](https://github.com/star-ss-qaq/star-node-framework/commit/c49c4687ff6eb1afeb505d6920eb59bd3bad1108))





# 1.0.0 (2026-10-22)


### Bug Fixes

* 临时解决服务器开发调试阶段的问题 ([0d46e55](https://github.com/star-ss-qaq/star-node-framework/commit/0d46e557e550e9d547b79ffefc7c6509d5334b83))
* 修复cli命令不能正确启动的问题 ([dcb522e](https://github.com/star-ss-qaq/star-node-framework/commit/dcb522e396425ca921cb9ba3afce46487a905e9f))
* **cli:** 解决打包及副作用问题 ([ab3216a](https://github.com/star-ss-qaq/star-node-framework/commit/ab3216a1bcdf33a6c3fdd39bac53711d01f5a302))
* **cli:** 解决实际开发预编译时系统模块sideOnly注释不生效导致前端处理失败的问题 ([e3924ac](https://github.com/star-ss-qaq/star-node-framework/commit/e3924ac2119a58544624322547a2b2e3e9a106f5))
* **cli:** 修复非js/ts文件也会被处理的问题 ([14bd050](https://github.com/star-ss-qaq/star-node-framework/commit/14bd05099a0f7e350be141c7788865a334376818))
* **cli:** 修复build时绝对路径仍然被额外拼接路径的问题 ([d301673](https://github.com/star-ss-qaq/star-node-framework/commit/d301673b3a05f17cb5ec03860ed4ba1e2bfa85a7))
* **cli:** 修复deepkit只有在ts中才能工作 ([9cf2326](https://github.com/star-ss-qaq/star-node-framework/commit/9cf23260a13932da7c0c7f1ee1b59d76ace1427d))
* **cli:** 修复ts转换插件执行时机不正确导致转换失败 ([531d8c6](https://github.com/star-ss-qaq/star-node-framework/commit/531d8c617f455dd3e3b2acab21d47ba02c2fec24))
* **cli:** 用户配置文件不存在时不报错，但是存在但有错误时需要报错 ([cfa6cec](https://github.com/star-ss-qaq/star-node-framework/commit/cfa6cec22cda855bdcaa5d7919b4202dd7f09f12))
* **cli:** 优化sideonly执行范围 ([018054d](https://github.com/star-ss-qaq/star-node-framework/commit/018054d6a7fa1ef8aa1d72b72ea8dfdb2dc7e533))
* **cli:** dev模式在用户代码错误时不要退出 ([74355ab](https://github.com/star-ss-qaq/star-node-framework/commit/74355ab98bc5e2477b7135922081dbb4e515fe78))
* **ts-helper:** 调整visiter格式 ([d2fadf3](https://github.com/star-ss-qaq/star-node-framework/commit/d2fadf378e52611dcf552c24e64944e6ae0d960e))


### Features

* 调整修饰器规则以便将更多内容规则化 ([50f4b82](https://github.com/star-ss-qaq/star-node-framework/commit/50f4b82f668d8d6fe26b7e2ca00113863a3e99a4))
* 发布准备 ([2e4f171](https://github.com/star-ss-qaq/star-node-framework/commit/2e4f17163dca5e2fee8312825f1483e464ffa1f0))
* 解决编译问题 ([341ae39](https://github.com/star-ss-qaq/star-node-framework/commit/341ae39d3f028bb1dd6f61dc04469e34c414fd1e))
* **apo-web:** 将运行环境与编译等环境分开，确保服务端只需安装最基础代码，其余代码由项目提供 ([158386f](https://github.com/star-ss-qaq/star-node-framework/commit/158386fdf22e19ad02dafa362bf004c6e3773aa1))
* **cli&app-web:** 更新规则 ([24a99df](https://github.com/star-ss-qaq/star-node-framework/commit/24a99dfab4a5a57ccbc776e231546db0b2a36eda))
* **cli&app-web:** 增加修饰器规则 将接口代码从前端移除 ([d5633ca](https://github.com/star-ss-qaq/star-node-framework/commit/d5633caeb6218db7f96fcf56b6b09cd8d4fb761c))
* **cli&app-web:** dev命令的应用实例创建现在交给cli ([7d2c409](https://github.com/star-ss-qaq/star-node-framework/commit/7d2c409e7f66f2e28ed460e79f55ca063ec43b1e))
* **cli&web:** 支持web程序dev命令 ([f4f25b6](https://github.com/star-ss-qaq/star-node-framework/commit/f4f25b611ec3865091b7ae16c29422fe01646fca))
* **cli:** 调整dev插件钩子名称 ([349fc7b](https://github.com/star-ss-qaq/star-node-framework/commit/349fc7bb1879024bd4b9b5d4da4494b9290926c5))
* **cli:** 完成环境分隔和side获取等基本配置 ([722e4c9](https://github.com/star-ss-qaq/star-node-framework/commit/722e4c96199db00143f1ac02af46814f6d192fc7))
* **cli:** 现在使用ts-helper的Scope能力检测变量的导入 ([3c75832](https://github.com/star-ss-qaq/star-node-framework/commit/3c75832ab2f3505151525caef63e88b405158c54))
* **cli:** 增加注释版本side-only的注释版本并默认启用插件 ([7f694f5](https://github.com/star-ss-qaq/star-node-framework/commit/7f694f5cf81673b387bc44aef173587784ec3479))
* **cli:** 增加自动di支持 ([bbf23e9](https://github.com/star-ss-qaq/star-node-framework/commit/bbf23e9da7a935c162636ca4bb4dd25bcf6c2147))
* **cli:** 支持编译项目 ([ac6de0a](https://github.com/star-ss-qaq/star-node-framework/commit/ac6de0afa3c377426be3770144e2a595cac380dd))
* **cli:** 支持配置文件添加vite插件 ([2a6b8e7](https://github.com/star-ss-qaq/star-node-framework/commit/2a6b8e74ef4df9110b513bb4a6ed911ff7635ba3))
* **cli:** sideOnly完全配置化 ([6f2fa97](https://github.com/star-ss-qaq/star-node-framework/commit/6f2fa976409db33145b501681b37faa41ced91af))
* TS SideOnly功能 ([e2c64ed](https://github.com/star-ss-qaq/star-node-framework/commit/e2c64ed3829628b03286806bf7dd54367a7ea0c1))
* **web:** 初步打通浏览器加载 ([c49c468](https://github.com/star-ss-qaq/star-node-framework/commit/c49c4687ff6eb1afeb505d6920eb59bd3bad1108))
