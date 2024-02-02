//原始的webpack（未拆分） 支持项目的打包和调试
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

// 获取 cross-env 定义的环境变量
const isProd = () => process.env.NODE_ENV === 'production';

const svgRegex = /\.svg$/;
const otherRegex = /\.(woff2?|ttf)$/;
const jsRegex = /\.(js|mjs|jsx|ts|tsx)$/;
const imgRegex = /\.(jpe?g|png|gif|webp)$/;
const moduleRegex = /node_modules/;
const cssRegex = /\.css$/;
const sassRegex = /\.(scss|sass)$/;

const chunkReact = /[\\/]node_modules[\\/]react(.*)?[\\/]/;
const chunkAntd = '/[\\\\/]node_modules[\\\\/]antd[\\\\/]/';
const chunkEcharts = '/[\\\\/]node_modules[\\\\/]echarts(-*)?[\\\\/]/';
const chunkLibs = '/[\\\\/]node_modules[\\\\/]/';

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

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

// 返回处理样式loader函数
const getStyleLoaders = (pre) =>
  [
    isProd() ? MiniCssExtractPlugin.loader : 'style-loader',
    //解决react 样式 冲突 CssModule
    {
      loader: 'css-loader',
      options: {
        modules: {
          localIdentName: '[path][name]-[local]', //--[hash:base64:5]
        },
      },
    },
    // 配合package.json中browserslist来指定兼容性
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          config: resolve('postcss.config.js'),
        },
      },
    },
    pre && {
      loader: pre,
      options: {},
    },
  ].filter(Boolean);

module.exports = {
  mode: process.env.NODE_ENV,
  devtool: isProd() ? false : 'eval-cheap-module-source-map', //线上版本不生成map文件
  entry: {
    main: [resolve('src/main.js')],
  },
  target: ['browserslist'],
  output: {
    path: isProd() ? resolve('dist') : undefined,
    publicPath: isProd() ? `/${process.env.PUBLIC_PATH}/` : '', //上线后服务器文件夹路径可能需要调整
    filename: isProd() ? 'static/js/[name].[contenthash:10].js' : 'static/js/[name].js',
    chunkFilename: isProd()
      ? 'static/js/[name].[contenthash:10].chunk.js'
      : 'static/js/[name].chunk.js',
    assetModuleFilename: isProd()
      ? 'static/media/[contenthash:10][ext][query]'
      : 'static/media/[ext][query]',
    clean: true,
    // libraryTarget: 'umd' // 添加输出库配置
  },
  module: {
    rules: [
      // 处理css
      // 处理 Ant Design 样式
      {
        test: cssRegex,
        use: ['style-loader', 'css-loader'],
      },
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
        ],
      },
    ],
  },
  plugins: [
    // 处理html
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: resolve('public/index.html'),
      hash: true, // 防止js缓存
      minify: {
        removeAttributeQuotes: true, // 压缩 去掉引号
      },
      version: Date.now(), // 将版本号传递给模板  防止index.html  图标和公共样式缓存
    }),

    // 压缩css
    isProd() &&
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash:10].css',
        chunkFilename: 'css/[name].[contenthash:10].chunk.css',
      }),

    // 复制public内的自定义内容
    new CopyPlugin({
      patterns: [
        {
          from: resolve('public'), //打包的静态资源目录地址
          to: resolve('dist'), //打包到 dist
          globOptions: {
            // 忽略index.html文件 '**/imgs/**',
            ignore: ['**/index.html', '**/README.md'],
          },
        },
      ],
    }),
    //webpack 5 以前的版本包含 polyfills。
    new NodePolyfillPlugin(),
    //热更新  React组件
    !isProd() && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
  optimization: isProd()
    ? {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // react react-dom react-router-dom 一起打包成一个js文件
            react: {
              test: chunkReact,
              name: 'chunk-react',
              priority: 100,
            },
            // antd 单独打包
            antd: {
              test: chunkAntd,
              name: 'chunk-antd',
              priority: 90,
            },
            // echarts 单独打包
            echarts: {
              test: chunkEcharts,
              name: 'chunk-echarts',
              priority: 80,
            },
            // 剩下node_modules单独打包
            libs: {
              test: chunkLibs,
              name: 'chunk-libs',
              priority: 10,
            },
          },
        },
        runtimeChunk: 'single',
        // 是否需要压缩
        minimize: true,
        minimizer: [
          new CssMinimizerWebpackPlugin(),
          new TerserWebpackPlugin({
            terserOptions: {
              compress: {
                drop_debugger: true, // 移除debugger
              },
              mangle: true, // 注意 `mangle.properties` 选项
              output: {
                comments: false, // 删除所有的注释
              },
            },
          }),
        ],
      }
    : {
        splitChunks: false,
      },
  // webpack解析模块加载选项
  resolve: {
    // 自动补全文件扩展名
    extensions: ['.jsx', '.js', '.ts', '.tsx', '.json'],
    // 设置别名
    alias: {
      '@': resolve('src'),
    },
  },
  performance: false, // 关闭性能分析，提升打包速度
  devServer: {
    host: '0.0.0.0',
    // port: 9001,
    open: true, // 在服务器启动后打开默认浏览器
    hot: true, // 开启HMR
    client: {
      overlay: true, // 浏览器全屏显示错误信息
    },
    compress: true, // 启用gzip压缩
    historyApiFallback: true, // 解决前端路由刷新404问题
  },
};
