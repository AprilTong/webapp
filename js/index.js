(function() {
    //html5本地存储,localstorage在同一域名下共享
    var Util = (function() {
        var prefix = 'html5_reader_';
        var StorageGetter = function(key) {
            return localStorage.getItem(prefix + key);
        };
        var StorageSetter = function(key, val) {
            return localStorage.setItem(prefix + key, val);
        };
        //利用插件jquery.jsonp做跨域数据处理，它支持出错时的 Ajax 回调
        var getJSONP = function(url, callback) {
            return $.jsonp({
                url: url,
                cache: true,
                callback: 'duokan_fiction_chapter',
                success: function(result) {
                    var data = $.base64.decode(result);
                    var json = decodeURIComponent(escape(data));
                    callback(json);
                }
            })
        };
        return {
            getJSONP: getJSONP,
            StorageGetter: StorageGetter,
            StorageSetter: StorageSetter
        }
    })();

    var Dom = {
        top_nav: $('#top_nav'),
        bottom_nav: $('#bottom_nav'),
        font_container: $('.font-container'),
        font_button: $('#font-button'),
        bk_container: $('.bk-container'),
    };
    var Win = $(window);
    var Doc = $(document);
    var readModel;
    var readUI;
    var RootContainer = $('#fiction_container');
    var initFontSize = Util.StorageGetter('font_size');
    var backgroundColor = Util.StorageGetter('background');
    initFontSize = parseInt(initFontSize);
    if (!initFontSize) {
        initFontSize = 14;
    }
    RootContainer.css('font-size', initFontSize);
    RootContainer.css('background', backgroundColor);

    function main() {
        //整个项目的入口函数
        readModel = ReadModel();
        readUI = ReaderBaseFrame(RootContainer);
        readModel.init(function(data) {
            readUI(data);
        });

        EventHanlder();
    }
    //数据层
    function ReadModel() {
        //实现和阅读器先关的数据交互的方法
        var Chapter_id;
        var ChapterTotal;
        //初始化函数
        var init = function(UIcallback) {
            getFictionInfo(function() {
                getCurChapterContent(Chapter_id, function(data) {
                    UIcallback && UIcallback(data);
                });
            })
        };
        //获取章节信息
        var getFictionInfo = function(callback) {
            //跨域请求
            $.get('data/chapter.json', function(data) {
                //获得章节信息后的回调
                Chapter_id = Util.StorageGetter('last_chapter_id');
                if (Chapter_id == null) {
                    Chapter_id = data.chapters[1].chapter_id;
                }
                ChapterTotal = data.chapters.length;
                callback && callback();
            }, 'json')
        };
        //获取章节内容
        var getCurChapterContent = function(chapter_id, callback) {
            $.get('data/data' + chapter_id + '.json', function(data) {
                //获取章节的内容
                if (data.result == 0) {
                    var url = data.jsonp;
                    Util.getJSONP(url, function(data) {
                        callback && callback(data);
                    });
                }
            }, 'json');
        };
        //上一章事件处理函数
        var prevChapter = function(UIcallback) {
            Chapter_id = parseInt(Chapter_id, 10);
            if (Chapter_id === 0) {
                return;
            }
            Chapter_id -= 1;
            getCurChapterContent(Chapter_id, UIcallback);
            Util.StorageSetter('last_chapter_id', Chapter_id);
        };
        //下一章事件处理函数
        var nextChapter = function(UIcallback) {
            Chapter_id = parseInt(Chapter_id, 10);
            if (Chapter_id === ChapterTotal) {
                return;
            }
            Chapter_id += 1;
            getCurChapterContent(Chapter_id, UIcallback);
            Util.StorageSetter('last_chapter_id', Chapter_id);
        };
        return {
            init: init,
            prevChapter: prevChapter,
            nextChapter: nextChapter,
        }
    }

    function ReaderBaseFrame(container) {
        //todo 渲染基本的UI结构
        function parseChapterData(jsonData) {
            var jsonObj = JSON.parse(jsonData);
            var html = '<h4>' + jsonObj.t + '</h4>';
            for (var i = 0; i < jsonObj.p.length; i++) {
                html += '<p>' + jsonObj.p[i] + '</p>'
            }
            return html;
        }
        return function(data) {
            container.html(parseChapterData(data));
        }
    }

    function EventHanlder() {
        //控制层的作用
        //交互的事件绑定
        //安卓4.0前，click事件有一定延迟（300ms）
        //zepto 模拟的点击tap事件
        //控制顶部和底部导航栏的显示与隐藏
        $('#action_mid').click(function() {
            if (Dom.top_nav.css('display') == "none") {
                Dom.top_nav.show();
                Dom.bottom_nav.show();
            } else {
                Dom.top_nav.hide();
                Dom.bottom_nav.hide();
                Dom.font_container.hide();
                $('.icon-ft').removeClass('current');
            }

        });
        Dom.font_button.click(function() {
            if (Dom.font_container.css('display') == "none") {
                Dom.font_container.show();
                $('.icon-ft').addClass('current');

            } else {
                Dom.font_container.hide();
                $('.icon-ft').removeClass('current');
            }
        });
        $('#large-font').click(function() {
            if (initFontSize > 20)
                return;
            initFontSize += 1;
            RootContainer.css('font-size', initFontSize);
            Util.StorageSetter('font_size', initFontSize);
        });

        $('#small-font').click(function() {
            if (initFontSize < 12)
                return;
            initFontSize -= 1;
            RootContainer.css('font-size', initFontSize);
            Util.StorageSetter('font_size', initFontSize);
        });
        //设置背景颜色，each函数用来遍历
        $.each(Dom.bk_container, function(index, value) {
            Dom.bk_container[index].onclick = function() {
                backgroundColor = $(Dom.bk_container[index]).css('background').slice(0, 18);
                RootContainer.css('background', backgroundColor);
                Util.StorageSetter('background', backgroundColor);
            };
        });
        $('#daytime-button').click(function() {
            $('#daytime-button').hide();
            $('#night-button').show();
            RootContainer.css('background', '#e9dfc7');
            Util.StorageSetter('background', '#e9dfc7');
        });
        $('#night-button').click(function() {
            $('#daytime-button').show();
            $('#night-button').hide();
            RootContainer.css('background', '#000');
            Util.StorageSetter('background', '#000');
        });
        //鼠标滑动时触发事件处理
        Win.scroll(function() {
            Dom.top_nav.hide();
            Dom.bottom_nav.hide();
            Dom.font_container.hide();
            $('.icon-ft').removeClass('current');
        });
        //章节翻页，先获得章节的翻页数据，再把数据拿出来渲染
        $('#prev_button').click(function() {
            readModel.prevChapter(function(data) {
                readUI(data);
            });
        });
        $('#next_button').click(function() {
            readModel.nextChapter(function(data) {
                readUI(data);
            });
        });
    }
    main();
})();
