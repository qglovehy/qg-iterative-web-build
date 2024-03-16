`qgtools` 是基于webpack的自定义构建工具 用于构建React项目

支持构建`React TS公共组件`、`实际项目的本地调试`、`构建发布`

1.0.25  publicPath=> ''

包含：
(1) CSSModule
(2) SCSS
(3) SVG雪碧图loader
(4) 静态资源处理
(5) 其他资源处理
(6) @别名
(7) PostCSS
(8) CSS压缩，JS压缩，处理debugger、console、注释处理
(9) 代码分割等等。

示例项目展示：
http://103.117.121.53:8001/

示例项目源码（包含了构建工具源码、组件库源码）：
https://gitee.com/qglove/qg-iterative-react-temp.git

组件库源码(使用自定义构建工具打包)：
https://gitee.com/qglove/qg-iterative-react-coms.git

自定义构建工具源码：
https://gitee.com/qglove/qg-iterative-web-build.git


目前雏形已经构建完毕 

1.开启本地调试 `qgtools startapp`

2.构建项目包 `qgtools buildapp`

3.构建TS公共组件库 `qgtools packageapp`