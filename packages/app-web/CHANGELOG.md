# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.1](https://github.com/star-ss-qaq/star-node-framework/compare/@thestarweb/star-framework-app-web@1.0.0...@thestarweb/star-framework-app-web@1.0.1) (2026-10-27)


### Bug Fixes

* **app-web:** 修复包格式 ([c053139](https://github.com/star-ss-qaq/star-node-framework/commit/c05313928d7046f8a526a4928718f566abc41527))





# 1.0.0 (2026-10-22)


### Bug Fixes

* **app-web:** 模拟res上实现一个已知需要被使用的方法 ([be8164d](https://github.com/star-ss-qaq/star-node-framework/commit/be8164d3eca78c761459d30e3448d840e09c2071))
* **app-web:** 修复编码问题 ([702a352](https://github.com/star-ss-qaq/star-node-framework/commit/702a3527346caa6b1d62e9ff1212f2c3f273079d))
* **app-web:** 修复错误引入多个vite客户端问题 ([98c530c](https://github.com/star-ss-qaq/star-node-framework/commit/98c530ce21b7a79e7235912b9589c996e4272330))
* **app-web:** 修复路由跳转时 父子渲染器重复渲染、挂载信息未正确清除导致重复挂载等问题 ([8b6f226](https://github.com/star-ss-qaq/star-node-framework/commit/8b6f2267cd5a31f542d041f9bd7b8591d5ff97d8))
* **app-web:** 增加数据上下文监听的移除工作 ([bfbf435](https://github.com/star-ss-qaq/star-node-framework/commit/bfbf435b4276fddc3c95176577783c17c0522b2c))
* **app-web:** 增加Param参数的导出 ([47af9a3](https://github.com/star-ss-qaq/star-node-framework/commit/47af9a3479c7f3b63fff19cadb95f6ae2b506eb6))


### Features

* 初步完成http到web应用的数据转换 ([bf6fd0e](https://github.com/star-ss-qaq/star-node-framework/commit/bf6fd0e3f3ed6fb722d77a71ec4ab08098f30ce5))
* 发布准备 ([2e4f171](https://github.com/star-ss-qaq/star-node-framework/commit/2e4f17163dca5e2fee8312825f1483e464ffa1f0))
* 解决编译问题 ([341ae39](https://github.com/star-ss-qaq/star-node-framework/commit/341ae39d3f028bb1dd6f61dc04469e34c414fd1e))
* 优化web route部分 ([440cda2](https://github.com/star-ss-qaq/star-node-framework/commit/440cda2203414b9441e7d857d6b4e053b5ddedca))
* 增加html解析能力 ([d976db0](https://github.com/star-ss-qaq/star-node-framework/commit/d976db03c4e1a55a37f2bb224c8e6a8961046803))
* 增加json格式的body解析 ([95e679f](https://github.com/star-ss-qaq/star-node-framework/commit/95e679f797cb4793fccd3737872e08a04c481b06))
* 重新将类型调整为数字类型枚举提高运行时匹配效率 ([88a7b74](https://github.com/star-ss-qaq/star-node-framework/commit/88a7b7459720041a45dc0e10a15d0027d98ad3ef))
* **apo-web:** 将运行环境与编译等环境分开，确保服务端只需安装最基础代码，其余代码由项目提供 ([158386f](https://github.com/star-ss-qaq/star-node-framework/commit/158386fdf22e19ad02dafa362bf004c6e3773aa1))
* **app-web&app-web-vue:** 增加request等基础能力 ([acdc52d](https://github.com/star-ss-qaq/star-node-framework/commit/acdc52d6e554d2e9943a66d2924b7e3d432ae824))
* **app-web&route:** 增加静态数据路由 ([5057566](https://github.com/star-ss-qaq/star-node-framework/commit/50575667aad7fab5931a5cd991203f5cf97b3f87))
* **app-web&utils:** 增加查找整个原型链上的元数据，appweb支持注释和手动添加过滤器，dev模式不再依赖特有全局过滤器而是直接向根对象注册 ([823916d](https://github.com/star-ss-qaq/star-node-framework/commit/823916d650fb0ecbd92071de7683904653bf79b3))
* **app-web:** 初步完成ssr时后端数据同步给前端的工作 ([faa4065](https://github.com/star-ss-qaq/star-node-framework/commit/faa406530ddab9fbaf55f887612c9e019d83e80c))
* **app-web:** 初步增加view功能 ([123c06b](https://github.com/star-ss-qaq/star-node-framework/commit/123c06bd1949fcfb3e8c8f3f359b9d0bedf79c20))
* **app-web:** 使用原生TransformStream接口替换Nodestream的内容以便能够兼容跨平台并避免这些被浏览器引入导致报错 ([9fa8fd8](https://github.com/star-ss-qaq/star-node-framework/commit/9fa8fd840205d172e08e59cac144d8cfc8b4d9eb))
* **app-web:** 完成客户端激活逻辑 ([405d8e9](https://github.com/star-ss-qaq/star-node-framework/commit/405d8e9c1503a53b80865ecba7f23b12a747efe4))
* **app-web:** 完善返回类型 ([1967892](https://github.com/star-ss-qaq/star-node-framework/commit/19678925cadb14b89014e0423798949143efb58b))
* **app-web:** 增加接口类型定义文件 ([db0ae87](https://github.com/star-ss-qaq/star-node-framework/commit/db0ae879fcb706668328c84619777b63f42eb634))
* **app-web:** 增加拦截器功能 ([efa084a](https://github.com/star-ss-qaq/star-node-framework/commit/efa084aa024f09a7fb18bde49e401ae3c13b1281))
* **app-web:** 增加渲染数据上下文 ([940211a](https://github.com/star-ss-qaq/star-node-framework/commit/940211a0a2c77f73a052b024e98c032a2c79eb6f))
* **app-web:** 增加a标签的点击拦截 ([6035a0b](https://github.com/star-ss-qaq/star-node-framework/commit/6035a0b97dc72fc2d865522154bea45aa4b1f2f4))
* **app-web:** 增加param支持 ([4bfe89b](https://github.com/star-ss-qaq/star-node-framework/commit/4bfe89bf1001a76a7018cb1ff5aa638ad85681c5))
* **app-web:** 增加view-meta提供title及meta的注入 ([37e9b4b](https://github.com/star-ss-qaq/star-node-framework/commit/37e9b4b10285e88fedd9213e8da08a39d3d7e387))
* **cli&app-web:** 更新规则 ([24a99df](https://github.com/star-ss-qaq/star-node-framework/commit/24a99dfab4a5a57ccbc776e231546db0b2a36eda))
* **cli&app-web:** 增加修饰器规则 将接口代码从前端移除 ([d5633ca](https://github.com/star-ss-qaq/star-node-framework/commit/d5633caeb6218db7f96fcf56b6b09cd8d4fb761c))
* **cli&app-web:** dev命令的应用实例创建现在交给cli ([7d2c409](https://github.com/star-ss-qaq/star-node-framework/commit/7d2c409e7f66f2e28ed460e79f55ca063ec43b1e))
* **cli&web:** 支持web程序dev命令 ([f4f25b6](https://github.com/star-ss-qaq/star-node-framework/commit/f4f25b611ec3865091b7ae16c29422fe01646fca))
* **cli:** 调整dev插件钩子名称 ([349fc7b](https://github.com/star-ss-qaq/star-node-framework/commit/349fc7bb1879024bd4b9b5d4da4494b9290926c5))
* **cli:** 完成环境分隔和side获取等基本配置 ([722e4c9](https://github.com/star-ss-qaq/star-node-framework/commit/722e4c96199db00143f1ac02af46814f6d192fc7))
* **cli:** 支持编译项目 ([ac6de0a](https://github.com/star-ss-qaq/star-node-framework/commit/ac6de0afa3c377426be3770144e2a595cac380dd))
* **web-app-vue:** 增加app-web-vue ([9559078](https://github.com/star-ss-qaq/star-node-framework/commit/95590783de1dd117e752c47bdbfa6f543ecbb94b))
* **web-app:** 支持跳转 ([31b357e](https://github.com/star-ss-qaq/star-node-framework/commit/31b357e208f00fa734b9d69487f6e2521a0eb628))
* **web:** 初步打通浏览器加载 ([c49c468](https://github.com/star-ss-qaq/star-node-framework/commit/c49c4687ff6eb1afeb505d6920eb59bd3bad1108))





# 1.0.0 (2026-10-22)


### Bug Fixes

* **app-web:** 模拟res上实现一个已知需要被使用的方法 ([be8164d](https://github.com/star-ss-qaq/star-node-framework/commit/be8164d3eca78c761459d30e3448d840e09c2071))
* **app-web:** 修复编码问题 ([702a352](https://github.com/star-ss-qaq/star-node-framework/commit/702a3527346caa6b1d62e9ff1212f2c3f273079d))
* **app-web:** 修复错误引入多个vite客户端问题 ([98c530c](https://github.com/star-ss-qaq/star-node-framework/commit/98c530ce21b7a79e7235912b9589c996e4272330))
* **app-web:** 修复路由跳转时 父子渲染器重复渲染、挂载信息未正确清除导致重复挂载等问题 ([8b6f226](https://github.com/star-ss-qaq/star-node-framework/commit/8b6f2267cd5a31f542d041f9bd7b8591d5ff97d8))
* **app-web:** 增加数据上下文监听的移除工作 ([bfbf435](https://github.com/star-ss-qaq/star-node-framework/commit/bfbf435b4276fddc3c95176577783c17c0522b2c))
* **app-web:** 增加Param参数的导出 ([47af9a3](https://github.com/star-ss-qaq/star-node-framework/commit/47af9a3479c7f3b63fff19cadb95f6ae2b506eb6))


### Features

* 初步完成http到web应用的数据转换 ([bf6fd0e](https://github.com/star-ss-qaq/star-node-framework/commit/bf6fd0e3f3ed6fb722d77a71ec4ab08098f30ce5))
* 发布准备 ([2e4f171](https://github.com/star-ss-qaq/star-node-framework/commit/2e4f17163dca5e2fee8312825f1483e464ffa1f0))
* 解决编译问题 ([341ae39](https://github.com/star-ss-qaq/star-node-framework/commit/341ae39d3f028bb1dd6f61dc04469e34c414fd1e))
* 优化web route部分 ([440cda2](https://github.com/star-ss-qaq/star-node-framework/commit/440cda2203414b9441e7d857d6b4e053b5ddedca))
* 增加html解析能力 ([d976db0](https://github.com/star-ss-qaq/star-node-framework/commit/d976db03c4e1a55a37f2bb224c8e6a8961046803))
* 增加json格式的body解析 ([95e679f](https://github.com/star-ss-qaq/star-node-framework/commit/95e679f797cb4793fccd3737872e08a04c481b06))
* 重新将类型调整为数字类型枚举提高运行时匹配效率 ([88a7b74](https://github.com/star-ss-qaq/star-node-framework/commit/88a7b7459720041a45dc0e10a15d0027d98ad3ef))
* **apo-web:** 将运行环境与编译等环境分开，确保服务端只需安装最基础代码，其余代码由项目提供 ([158386f](https://github.com/star-ss-qaq/star-node-framework/commit/158386fdf22e19ad02dafa362bf004c6e3773aa1))
* **app-web&app-web-vue:** 增加request等基础能力 ([acdc52d](https://github.com/star-ss-qaq/star-node-framework/commit/acdc52d6e554d2e9943a66d2924b7e3d432ae824))
* **app-web&route:** 增加静态数据路由 ([5057566](https://github.com/star-ss-qaq/star-node-framework/commit/50575667aad7fab5931a5cd991203f5cf97b3f87))
* **app-web&utils:** 增加查找整个原型链上的元数据，appweb支持注释和手动添加过滤器，dev模式不再依赖特有全局过滤器而是直接向根对象注册 ([823916d](https://github.com/star-ss-qaq/star-node-framework/commit/823916d650fb0ecbd92071de7683904653bf79b3))
* **app-web:** 初步完成ssr时后端数据同步给前端的工作 ([faa4065](https://github.com/star-ss-qaq/star-node-framework/commit/faa406530ddab9fbaf55f887612c9e019d83e80c))
* **app-web:** 初步增加view功能 ([123c06b](https://github.com/star-ss-qaq/star-node-framework/commit/123c06bd1949fcfb3e8c8f3f359b9d0bedf79c20))
* **app-web:** 使用原生TransformStream接口替换Nodestream的内容以便能够兼容跨平台并避免这些被浏览器引入导致报错 ([9fa8fd8](https://github.com/star-ss-qaq/star-node-framework/commit/9fa8fd840205d172e08e59cac144d8cfc8b4d9eb))
* **app-web:** 完成客户端激活逻辑 ([405d8e9](https://github.com/star-ss-qaq/star-node-framework/commit/405d8e9c1503a53b80865ecba7f23b12a747efe4))
* **app-web:** 完善返回类型 ([1967892](https://github.com/star-ss-qaq/star-node-framework/commit/19678925cadb14b89014e0423798949143efb58b))
* **app-web:** 增加接口类型定义文件 ([db0ae87](https://github.com/star-ss-qaq/star-node-framework/commit/db0ae879fcb706668328c84619777b63f42eb634))
* **app-web:** 增加拦截器功能 ([efa084a](https://github.com/star-ss-qaq/star-node-framework/commit/efa084aa024f09a7fb18bde49e401ae3c13b1281))
* **app-web:** 增加渲染数据上下文 ([940211a](https://github.com/star-ss-qaq/star-node-framework/commit/940211a0a2c77f73a052b024e98c032a2c79eb6f))
* **app-web:** 增加a标签的点击拦截 ([6035a0b](https://github.com/star-ss-qaq/star-node-framework/commit/6035a0b97dc72fc2d865522154bea45aa4b1f2f4))
* **app-web:** 增加param支持 ([4bfe89b](https://github.com/star-ss-qaq/star-node-framework/commit/4bfe89bf1001a76a7018cb1ff5aa638ad85681c5))
* **app-web:** 增加view-meta提供title及meta的注入 ([37e9b4b](https://github.com/star-ss-qaq/star-node-framework/commit/37e9b4b10285e88fedd9213e8da08a39d3d7e387))
* **cli&app-web:** 更新规则 ([24a99df](https://github.com/star-ss-qaq/star-node-framework/commit/24a99dfab4a5a57ccbc776e231546db0b2a36eda))
* **cli&app-web:** 增加修饰器规则 将接口代码从前端移除 ([d5633ca](https://github.com/star-ss-qaq/star-node-framework/commit/d5633caeb6218db7f96fcf56b6b09cd8d4fb761c))
* **cli&app-web:** dev命令的应用实例创建现在交给cli ([7d2c409](https://github.com/star-ss-qaq/star-node-framework/commit/7d2c409e7f66f2e28ed460e79f55ca063ec43b1e))
* **cli&web:** 支持web程序dev命令 ([f4f25b6](https://github.com/star-ss-qaq/star-node-framework/commit/f4f25b611ec3865091b7ae16c29422fe01646fca))
* **cli:** 调整dev插件钩子名称 ([349fc7b](https://github.com/star-ss-qaq/star-node-framework/commit/349fc7bb1879024bd4b9b5d4da4494b9290926c5))
* **cli:** 完成环境分隔和side获取等基本配置 ([722e4c9](https://github.com/star-ss-qaq/star-node-framework/commit/722e4c96199db00143f1ac02af46814f6d192fc7))
* **cli:** 支持编译项目 ([ac6de0a](https://github.com/star-ss-qaq/star-node-framework/commit/ac6de0afa3c377426be3770144e2a595cac380dd))
* **web-app-vue:** 增加app-web-vue ([9559078](https://github.com/star-ss-qaq/star-node-framework/commit/95590783de1dd117e752c47bdbfa6f543ecbb94b))
* **web-app:** 支持跳转 ([31b357e](https://github.com/star-ss-qaq/star-node-framework/commit/31b357e208f00fa734b9d69487f6e2521a0eb628))
* **web:** 初步打通浏览器加载 ([c49c468](https://github.com/star-ss-qaq/star-node-framework/commit/c49c4687ff6eb1afeb505d6920eb59bd3bad1108))
