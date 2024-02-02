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
 * webpackServiceTask
 * @return {Promise}
 */
function webpackServiceTask() {
  return new Promise((resolve, reject) => {
    const command = isWin32() ? 'webpack-dev-server.cmd' : 'webpack-dev-server';

    const babelProcess = spawn(
      command,
      ['--config', path.join(codePath, 'config', 'webpack.dev.js')],
      {
        cwd: runtimePath,
        encoding: 'utf-8',
        env: {
          ...process.env, // 继承当前进程的环境变量
          NODE_ENV: 'development',
          REAP_PATH: 'dev',
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
  build: () => webpackServiceTask(),
};
