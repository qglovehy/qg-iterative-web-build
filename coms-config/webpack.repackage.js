//未拆分的 webpack 支持打包
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const { getPostCssConfigPath } = require('./util');

const svgRegex = /\.svg$/;
const otherRegex = /\.(woff2?|ttf)$/;
const jsRegex = /\.(js|mjs|jsx|ts|tsx)$/;
const imgRegex = /\.(jpe?g|png|gif|webp)$/;
const moduleRegex = /node_modules/;
const cssRegex = /\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

// 配置文件路径
const runtimePath = __dirname;

const resolve = (dir) => path.join(runtimePath, '..', dir);

const entry = resolve('./src/index.js');

const babelConfig = {
  presets: [['@babel/preset-env'], '@babel/preset-react'],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-function-bind',
    '@babel/plugin-proposal-optional-chaining',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: false }],
  ],
  cacheDirectory: true,
};

// 返回处理样式loader函数
const getStyleLoaders = (pre) =>
  [
    MiniCssExtractPlugin.loader,
    //解决react 样式 冲突 CssModule
    {
      loader: 'css-loader',
      options: {
        modules: {
          localIdentName: '[local]', //--[hash:base64:5]
        },
      },
    },
    // 配合package.json中browserslist来指定兼容性
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          config: getPostCssConfigPath(runtimePath),
        },
      },
    },
    pre && {
      loader: pre,
      options: {},
    },
  ].filter(Boolean);

module.exports = {
  mode: 'production',
  devtool: 'cheap-module-source-map',
  // 入口文件
  entry,
  // 输出配置
  output: {
    path: resolve('lib'), // 输出目录
    filename: 'index.js', // 输出文件名
    library: {
      type: 'umd', // 通用模块定义
    },
    globalObject: 'this', // 兼容不同环境下的全局对象
  },
  // 解析模块请求的选项
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.json', '.scss', '.less'], // 自动解析确定的扩展
    // 设置别名
    alias: {
      '@': resolve('src'),
    },
  },
  // 模块配置
  module: {
    rules: [
      // 处理css
      // 处理 Ant Design 样式
      {
        test: cssRegex,
        use: ['style-loader', 'css-loader'],
      },
      //处理scss
      {
        test: sassRegex,
        exclude: moduleRegex,
        use: getStyleLoaders('sass-loader'),
      },
      // 处理图片
      {
        test: imgRegex,
        exclude: moduleRegex,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 20 * 1024,
          },
        },
      },
      // 处理图片
      {
        test: imgRegex,
        exclude: moduleRegex,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 20 * 1024,
          },
        },
      },
      // 处理Svg
      {
        test: svgRegex,
        include: [resolve('src/assets')], // 只处理指定文件夹下的文件
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              symbolId: 'icon-[name]', // symbol id 格式
            },
          },
        ],
      },
      // 处理其他资源
      {
        test: otherRegex,
        exclude: /node_modules/,
        type: 'asset/resource',
      },
      // 处理 JS TS 文件
      {
        test: jsRegex,
        exclude: moduleRegex,
        use: [
          {
            loader: 'babel-loader',
            options: babelConfig,
          },
          {
            loader: 'ts-loader',
            options: {
              configFile: resolve('tsconfig.json'), // 指定 TypeScript 配置文件
            },
          },
        ],
      },
    ],
  },
  // 插件配置
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'index.css', // 输出的 CSS 文件名
    }),
  ].filter(Boolean),
  optimization: {
    // 是否需要压缩
    minimize: true,
    minimizer: [
      new CssMinimizerWebpackPlugin(),
      new TerserWebpackPlugin({
        terserOptions: {
          compress: {
            // drop_console: true, // 移除console.log
            drop_debugger: true, // 移除debugger
          },
          mangle: true, // 注意 `mangle.properties` 选项
          output: {
            comments: false, // 删除所有的注释
          },
        },
      }),
    ],
  },
  // 外部依赖，避免将某些 import 的包打包到 bundle 中
  externals: {
    react: 'react', // React 作为外部依赖
    'react-dom': 'react-dom',
    '@ant-design/icons': '@ant-design/icons',
    antd: 'antd',
  },
  performance: false, // 关闭性能分析，提升打包速度
};
