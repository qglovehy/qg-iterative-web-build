#!/usr/bin/env node

const packageapp = require('../src/packageapp');
const buildapp = require('../src/buildapp');
const startapp = require('../src/startapp');

const typeJson = {
  packageapp,
  buildapp,
  startapp,
};

//构建类型 buildpackage build server
const TYPE = process.argv[2] || 'buildapp';

//开始打包构建
typeJson[TYPE]?.build();
