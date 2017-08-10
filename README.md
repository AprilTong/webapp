# webapp
基于HTML5的移动阅读器
开发环境：Windows7 + sublime
框架：zepto.js + jquery.jsonp.js + jquery.base64.js
zepto.js：体积小，适用于手机浏览器，语法和jquery类似；
Jquery.jsonp.js:一个支持JSONP调用的jquery插件，支持出错时的Ajax回调；
jquery.base64.js：实现前台的加密解密(图片利用base64代码体积大但可以减少http请求)；
项目描述：利用HTML5、Ajax、js相关框架等技术开发的一款移动端阅读器；并且会通过HTML5的Localstorage把设置的背景颜色、字体大小等信息储存在本地；阅读器的内容是模拟后台数据，通过ajax本地跨域获取数据并通过jsonp对数据进行相关处理将其展现出来；使用base64制作背景图片，减少http请求，加快首屏显示速度；
重要源码：将入口函数、数据交互、Dom事件等分离开来，使代码更加易读、维护；并且使用闭包来避免全局变量污染，将复用的Dom利用变量存储起来；在使用HTML5存储时，为了避免同于情况下相同，增加前缀来区分；
