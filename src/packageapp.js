#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');
const logger = require('npmlog');
const { isWin32 } = require('./config/util');

// 运行命令的路径
const runtimePath = process.cwd();

// build.js所在的路径
const codePath = __dirname;

/**
 * webpackTask
 * @return {Promise}
 */
function webpackTask() {
  return new Promise((resolve) => {
    const command = isWin32() ? 'webpack.cmd' : 'webpack';

    const babelProcess = spawn(
      command,
      ['--config', path.join(codePath, 'config', 'webpack.buildpackage.js')],
      {
        cwd: runtimePath,
        encoding: 'utf-8',
        env: {
          ...process.env, // 继承当前进程的环境变量
          NODE_ENV: 'production',
          REAP_PATH: 'pro',
        },
      },
    );

    babelProcess.stdout.on('data', (data) => {
      logger.info(`${data}`);
    });

    babelProcess.stdin.on('data', (data) => {
      logger.info(`${data}`);
    });

    babelProcess.stderr.on('data', (data) => {
      logger.warn(`${data}`);
    });

    babelProcess.on('close', () => {
      resolve();
    });
  });
}

module.exports = {
  build: () => webpackTask(),
};
