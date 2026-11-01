# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.3](https://github.com/star-ss-qaq/star-node-framework/compare/@thestarweb/star-framework-db@1.0.2...@thestarweb/star-framework-db@1.0.3) (2026-11-01)

**Note:** Version bump only for package @thestarweb/star-framework-db





## [1.0.2](https://github.com/star-ss-qaq/star-node-framework/compare/@thestarweb/star-framework-db@1.0.1...@thestarweb/star-framework-db@1.0.2) (2026-11-01)


### Bug Fixes

* **db:** 修复数据库执行的报错无法正确抛出的bug ([21f4cf9](https://github.com/star-ss-qaq/star-node-framework/commit/21f4cf9defc666d4a7a0aa77fe26d7ec2793ee54))
* **db:** 修复And和Or条件参数要求至少有一个输入的ts定义与rest展开冲突，先移除这个设计并再merge中增加兜底 ([a5b78aa](https://github.com/star-ss-qaq/star-node-framework/commit/a5b78aa7b259736ea2152d74cff68bf8f8673c92))
* **db:** 修复select语句offset拼接错误的问题 ([76bad6e](https://github.com/star-ss-qaq/star-node-framework/commit/76bad6ec486c8f66ebb1dfa680e083a5c2f00e59))
* **db:** 修复update语句 ([bf66e31](https://github.com/star-ss-qaq/star-node-framework/commit/bf66e3181df136b41ae8a84e03d48c2b79441d2d))





## [1.0.1](https://github.com/star-ss-qaq/star-node-framework/compare/@thestarweb/star-framework-db@1.0.0...@thestarweb/star-framework-db@1.0.1) (2026-10-24)


### Bug Fixes

* **db:** 增加类型导出 ([50260c5](https://github.com/star-ss-qaq/star-node-framework/commit/50260c57e21e0d943531d4e7f6525f791ba99f8e))





# 1.0.0 (2026-10-22)


### Bug Fixes

* **db:** 修复增删改语句没有then方法无法执行的问题 ([a1c7f2c](https://github.com/star-ss-qaq/star-node-framework/commit/a1c7f2c097307045f831310fe8d0428e039eb2ca))
* **db:** 修复重复检查和编译问题 ([8fc670e](https://github.com/star-ss-qaq/star-node-framework/commit/8fc670e0ee25ece857354858bc49ba2c86192978))
* **db:** 修复sqlite自增长表创建问题 ([36475f7](https://github.com/star-ss-qaq/star-node-framework/commit/36475f781c795ffc31de4179d1690a6aaf275dcc))
* **db:** autoIncrement的字段也应当设置为不必填 ([cd6d535](https://github.com/star-ss-qaq/star-node-framework/commit/cd6d535f17d22bb1811fab3ca3c97ada14c89113))


### Features

* 初步增加sqlite的支持 ([c576f75](https://github.com/star-ss-qaq/star-node-framework/commit/c576f7518b08714ac20dda36d18ff802db31339b))
* 增加数据库工具 ([1acaf33](https://github.com/star-ss-qaq/star-node-framework/commit/1acaf3312b7df764adc0624c95bc5aa5ad748bce))
* 增加数据库结构比对升级功能 ([1404882](https://github.com/star-ss-qaq/star-node-framework/commit/14048827b438c403d42650a7cb111d81a0b75fc1))
* **db:** 增加数据库结构同步 ([c909cb0](https://github.com/star-ss-qaq/star-node-framework/commit/c909cb0d208829dfb9a0ef81697c3fc4b60daf22))
* **db:** 增加索引的支持 ([5376334](https://github.com/star-ss-qaq/star-node-framework/commit/5376334011b594fd425da396162ab2aa7967e7b9))





# 1.0.0 (2026-10-22)


### Bug Fixes

* **db:** 修复增删改语句没有then方法无法执行的问题 ([a1c7f2c](https://github.com/star-ss-qaq/star-node-framework/commit/a1c7f2c097307045f831310fe8d0428e039eb2ca))
* **db:** 修复重复检查和编译问题 ([8fc670e](https://github.com/star-ss-qaq/star-node-framework/commit/8fc670e0ee25ece857354858bc49ba2c86192978))
* **db:** 修复sqlite自增长表创建问题 ([36475f7](https://github.com/star-ss-qaq/star-node-framework/commit/36475f781c795ffc31de4179d1690a6aaf275dcc))
* **db:** autoIncrement的字段也应当设置为不必填 ([cd6d535](https://github.com/star-ss-qaq/star-node-framework/commit/cd6d535f17d22bb1811fab3ca3c97ada14c89113))


### Features

* 初步增加sqlite的支持 ([c576f75](https://github.com/star-ss-qaq/star-node-framework/commit/c576f7518b08714ac20dda36d18ff802db31339b))
* 增加数据库工具 ([1acaf33](https://github.com/star-ss-qaq/star-node-framework/commit/1acaf3312b7df764adc0624c95bc5aa5ad748bce))
* 增加数据库结构比对升级功能 ([1404882](https://github.com/star-ss-qaq/star-node-framework/commit/14048827b438c403d42650a7cb111d81a0b75fc1))
* **db:** 增加数据库结构同步 ([c909cb0](https://github.com/star-ss-qaq/star-node-framework/commit/c909cb0d208829dfb9a0ef81697c3fc4b60daf22))
* **db:** 增加索引的支持 ([5376334](https://github.com/star-ss-qaq/star-node-framework/commit/5376334011b594fd425da396162ab2aa7967e7b9))
