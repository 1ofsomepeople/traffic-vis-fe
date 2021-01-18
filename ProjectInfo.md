# TRAFFIC-VIS-FE

交通数据可视化系统前端项目说明文档

## 1. 项目环境配置、启动、构建

安装配置 node

```shell
git clone https://github.com/dingchaofan/traffic-vis-fe
cd traffic-vis-fe
yarn # 安装配置依赖包 需要配置安装yarn
# 或者 npm install

npm start # 启动项目，本地调试
npm build # 构建发布，生成build目录
```

在`npm start`后浏览器地址输入`http://localhost:3000/analysis`即可访问项目，进行项目本地测试

### 1.1 项目部署简介

本项目部署在服务器的Nginx中

配置参考流程: [从零搭建项目(11) --- 部署: 使用nginx部署前端项目](https://www.jianshu.com/p/3ecd75f69bd6)

常用Nginx指令

```shell
#测试配置文件是否正常
nginx -t
#重新应用配置文件
nginx -s reload
systemctl stop nginx
systemctl start nginx
```

### 1.2 项目Nginx部署流程

配置参考流程: [从零搭建项目(11) --- 部署: 使用nginx部署前端项目](https://www.jianshu.com/p/3ecd75f69bd6)

#### 1.2.1 安装Nginx

* 升级apt
* 安装git
* 安装node
* 安装npm
* 安装nginx

#### 1.2.2 配置项目Nginx

nginx的主配置目录位于`/etc/nginx/`中

项目所在目录：`/root/project/build/`;

在`/etc/nginx/conf.d`目录下新建一个`traffic.conf`文件作为项目的配置文件

我的`traffic.conf`配置

```shell
server{
        # 端口
        listen 80;
        # 域名
        server_name 39.105.230.32;
        location / {
                # 项目所在目录
                root /root/project/build/;
                # 默认打开的首页文件
                index index.html index,htm;
                # react router配置
                try_files $uri /index.html;
        }
        # 开启gzip
        gzip on;
        # 启用gzip压缩的最小文件，小于设置值的文件将不会压缩
        gzip_min_length 1k;
        # gzip 压缩级别，1-10，数字越大压缩的越好，也越占用CPU时间，后面会有详细说明
        gzip_comp_level 4;        
        # 进行压缩的文件类型。javascript有多种形式。其中的值可以在 mime.types 文件中找到。
        gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
        # 是否在http header中添加Vary: Accept-Encoding，建议开启
        gzip_vary on;
        # 禁用IE 6 gzip
        gzip_disable "MSIE [1-6]\.";
}
```

Nginx 403 500问题

* [](https://www.jianshu.com/p/8d66200c1c7e)
* 编辑`nginx.conf`将第一行的`user nginx`改为`user root`;
* 项目文件的权限设置 `chmod -R 755 build`
* 配置阿里云的安全组规则，添加端口白名单

## 2. 项目目录

注释中`#`越多，该目录和文件越关键，是可自定义功能和代码的关键位置
注释中`#`越少，目前需要修改的地方越少，可以暂时略过

```shell
.
├─build                                     ### npm build后生成的项目目录，无需手动修改
├─config                                    # 项目配置目录，webpack配置
├─node_modules                              # 项目依赖库
├─public                                    ### 项目public入口，项目的静态资源和文件要位于public目录下
|   ├─index.html                            # 项目入口index.html
├─script                                    # npm脚本
├─src                                       ##### 项目代码目录
|  ├─App.css                                ## 项目入口App组件 css
|  ├─App.js                                 ## 项目入口App组件
|  ├─App.test.js                            # 
|  ├─index.css                              # 项目入口index组件 css
|  ├─index.js                               # 项目入口index组件
|  ├─logo.svg                               # react自带logo图标
|  ├─serviceWorker.js                       #
|  ├─setupTests.js                          # 
|  ├─store                                  ##### mobx store代码目录，编写前后端接口
|  |   ├─analysisStore.js                   ##### 可视分析页所用到的store及接口
|  |   ├─index.js                           ##### 合成store
|  |   └predictCompareStore.js              ##### 预测分析页所用到的store及接口
|  ├─pages                                  ##### 页面及组件代码目录
|  |   ├─prediction                         ##### 预测分析页面组件
|  |   |     ├─PredictionAnalysis.css
|  |   |     └PredictionAnalysis.js
|  |   ├─home                               ##### 主页组件
|  |   |  ├─home.css
|  |   |  └Home.js
|  |   ├─analysis                           ##### 可视分析页面组件
|  |   |    ├─Analysis.css
|  |   |    └Analysis.js
|  ├─layouts                                ##### 页面布局组件，页面组件路由
|  |    ├─BasicLayout.css
|  |    └BasicLayout.js
|  ├─common                                 ##### 共用组件，共用函数
|  |   ├─apis.js                            ##### 自定义的复用函数
|  |   ├─EchartsMapBoxVis.css
|  |   ├─EchartsMapBoxVis.js                ##### 基于echarts-gl的以mapbox为底图的地图组件
|  |   ├─MapBoxPointsVis.js                 ### 基于mapbox的原生地图组件，未完成
|  |   ├─service.js                         ##### 后端接口地址，本地环境和线上环境的地址切换需要在这里完成
|  |   ├─basicCharts                        ##### 复用较多的图表组件
|  |   |      ├─JamScoreDash.js             ##### 仪表盘
|  |   |      ├─Line.js                     ##### 折线图
|  |   |      └Pie.js                       ##### 饼图
├─.gitignore                                # git忽略文件及目录配置    
├─package-lock.json                         # 依赖包版本
├─package.json                              # 依赖包版本
├─ProjectInfo.md                            ### * 项目说明书文档
├─README.md                                 # 项目脚手架create-react-app自带README.md，暂不做修改
├─yarn.lock                                 # 依赖包版本
```

## 3. 技术栈和工具库

1. [React](https://react.docschina.org/)
2. React的状态管理:
   1. [Mobx](https://cn.mobx.js.org/)
3. UI组件库:
   1. [Ant Design](https://ant.design/components/overview-cn/)
4. 可视化组件：
   1. [echarts/echarts-gl](https://echarts.apache.org/zh/index.html)
5. 地图:
   1. [Mapbox JS](http://www.mapbox.cn/mapbox-gl-js/api/)
6. [Axios：基于 promise 的 HTTP 库](http://axios-js.com/)

## 4. 其他

1. 前端开发工具建议使用VS Code，配置开发所需插件
   1. VS Code插件list可以参看 [github gist](https://gist.github.com/dingchaofan/1f325e718ba775336bfcd2730a4fae28)中`extensions.json`文件
2. 开发日志可参看git提交记录，建议使用[git commit提交规范](https://blog.csdn.net/ligang2585116/article/details/80284819)
