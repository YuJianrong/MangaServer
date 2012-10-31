//
// Copyright 2010 Yu Jianrong, All Rights Reserved
// 
// Licensed under BSD License.


// special case, remove iframe of dm5 page (not include the comic page)
if (window.location.host==="www.dm5.com" && !(/^\/m/.test(window.location.pathname)))
{
    var ifs=document.getElementsByTagName("iframe");
    for(var i=ifs.length-1; i>=0; --i)
        ifs[i].parentNode.removeChild(ifs[i]);
}
else
($___=function()
{
    var _window = window;
    var _document = document;
    var $_=function(id)
    {
        return _document.getElementById(id);
    };
    var m=_document.createElement("meta");
    m.name="viewport";
    var c_page=0;
    var div_imgs=[];
    var VerticalWritting = true;
    var Landscape= false;
    var MAXPRELOADPAGENUM = 10;

    var getPageURL=function(thePage) { return _window.location.href; };
    var div_postprocess = function(){};

    var configuration = localStorage.getItem("config")? JSON.parse(localStorage.getItem("config")):{};
    if (configuration.SmoothAnimation === undefined)
        configuration.SmoothAnimation = true;
    if (configuration.PreloadPages === undefined)
        configuration.PreloadPages = 4;

    var getCurrentPage,
        getPageCount,
        getImgURL,
        setCurrentPage,
        getPrevChapter,
        getNextChapter;

    var parseEngine={
        "dm5.com":function()
        {
            var url = window.location.href;
            DM5_PAGE = 1;
            if (url.indexOf('-p') > 0) {
                DM5_PAGE = parseInt(url.substring(url.indexOf("-p") + 2), 10);
            }
            croot = DM5_CURL.substring(0, DM5_CURL.length - 1) + "-p";

            var mkey = '';
            if ($("#dm5_key").length > 0) {
                mkey = $("#dm5_key").val();
            }
            getCurrentPage=function()
            {
                return DM5_PAGE-1;
            };
            getPageCount=function()
            {
                return DM5_IMAGE_COUNT;
            };
            getImgURL=function(thePage)
            {
                var ret="";

                $.ajax({
                        url: 'chapterimagefun.ashx',
                        data: { cid: DM5_CID, page: thePage+1, language:1, key:mkey },
                        type: 'GET',
                        async: false,
                        error: function (msg) {
                        },
                        success: function (msg) {
                            if (msg != '') {
                                var arr;
                                eval(msg);
                                ret = d[0];
                            };
                        }
                });

                return ret;
            };
            setCurrentPage=function(thePage)
            {
                DM5_PAGE = thePage+1;
            };
            getPageURL = function(thePage)
            {
                return croot + (thePage + 1) + "/";
            };

            getPrevChapter = function() { return false; };
            // var nurl=new String(window.location);
            // var cid=nurl.substring(nurl.indexOf("-")+1,nurl.indexOf("_"));
            // var nextUrl="../../tiaozhuan.aspx"+"?cid="+cid;
            getNextChapter = function() { return {text:"", href:DM5_CURL_END}; };

        }
        ,"u17.com":function()
        {
            VerticalWritting = false;

            getCurrentPage=function()
            {
                return u_page;
            };
            getPageCount=function()
            {
                return __htmlURL.length;
            };
            getImgURL=function(thePage)
            {
                var url=__htmlURL[thePage];
                //get the html
                var request = new XMLHttpRequest();
                request.open("GET", url, false);
                request.send();
                // request.responseText;
                return (/src="([^"]*)"/).exec(eee((/document.write\(eee\('([^']*)'/).exec(request.responseText)[1]))[1];
            };
            setCurrentPage=function(thePage)
            {
                u_page=thePage;
            };
            getPageURL = function(thePage)
            {
                return __htmlURL[thePage];
            };

            // build the htmlURLs
            if (!_window.__htmlURL)
            {
                u_page = 0;
                __htmlURL=[];
                var UrlBase = document.body.innerHTML.substr(document.body.innerHTML.indexOf("$('#comicShow')")).match(/location.href=(.*?)\+\$\("#comicShow"\).*?;/)[1];
                for (var i=0;i<$_('comicShow').options.length;++i)
                {
                    __htmlURL.push(eval(UrlBase)+$_('comicShow').options[i].value+'.html');
                    if ($_('comicShow').options[i].selected)
                        u_page=i;
                }
            };
            try{
                var btns = document.querySelectorAll(".comic_read_top dd.read_btn input");

                var ChapterInfo={next:false, prev:false};
                var nextUrl = String(btns[0].onclick).match(/href='(.*?)'/);
                if (nextUrl)
                    ChapterInfo.next ={text:"", href:nextUrl[1]};
                var prevUrl = String(btns[1].onclick).match(/href='(.*?)'/);
                if (prevUrl)
                    ChapterInfo.prev ={text:"", href:prevUrl[1]};

                getPrevChapter = function()
                {
                    return ChapterInfo.prev;
                };
                getNextChapter = function()
                {
                    return ChapterInfo.next;
                };
            } catch(E)
            {
                getPrevChapter = function() { return false; };
                getNextChapter = function() { return false; };
            }
        }
        ,"www.boston.com/bigpicture":function()
        {
            VerticalWritting = false;
            Landscape = true;

            if (!_window.__imgs)
            {
                u_page = 0;
                __imgs=[];
                var bpDivs = _document.getElementsByClassName("bpBoth");
                for (var i=0; i<bpDivs.length;++i)
                {
                    var photoNum=0;
                    try{ photoNum= bpDivs[i].getElementsByClassName("photoNum")[0].innerText;}catch(e){};
                    var cap = bpDivs[i].getElementsByClassName("bpCaption")[0].innerText;
                    if (photoNum)
                        cap = cap.substring(photoNum.length);
                    __imgs.push(
                        {
                            url:bpDivs[i].getElementsByClassName("bpImage")[0].src, 
                            // photoNum:bpDivs[i].getElementsByClassName("photoNum")[0].innerText,
                            // caption:bpDivs[i].getElementsByClassName("bpCaption")[0].childNodes[1].nodeValue 
                            caption:cap
                    });
                }
            };

            getCurrentPage=function()
            {
                return u_page;
            };
            getPageCount=function()
            {
                return __imgs.length;
            };
            getImgURL=function(thePage)
            {
                return __imgs[thePage].url;
            };
            setCurrentPage=function(thePage)
            {
                u_page=thePage;
            };

            div_postprocess = function(theDivImg)
            {
                theDivImg.appendChild(_document.createElement("br"));
                theDivImg.appendChild(_document.createTextNode(__imgs[theDivImg.page].caption));
                theDivImg.loadImg=function()
                {
                    var _this=this;
                    if(!this.unloaded)
                    {
                        return;
                    }
                    this.unloaded=false;
                    this.tImg.onload=function()
                    {
                        var _w=this.width;
                        var _h=this.height;
                        if (_this.scrollHeight>690)
                        {
                            this.height=this.height - (_this.scrollHeight-690);
                            this.width=Math.floor(_w*this.height/_h);
                        }
                        this.onload=null;
                    };
                    setTimeout(function() {
                            if (!_this.tImg.flink)
                                _this.tImg.flink=getImgURL(_this.page);
                            _this.tImg.src=_this.tImg.flink;
                        } ,0);
                    // this.className="bpCaption";
                    // this.tImg.style.position="relative";
                    // this.tImg.style.top="0px";
                    // this.tImg.style.left="0px";
                };
            };

            getPrevChapter = function() { return false; };
            getNextChapter = function() { return false; };

        }
        ,"www.imanhua.com/comic":function()
        {
            getCurrentPage=function()
            {
                return iNo-1;
            };
            getPageCount=function()
            {
                return len;
            };
            getImgURL=function(thePage)
            {
                return imanhua_host + encodeURI(pic[thePage]);
            };
            setCurrentPage=function(thePage)
            {
                iNo=thePage+1;
            };
            getPageURL = function(thePage)
            {
                return base + 'p=' + String(thePage);
            };
            getPrevChapter = function() { return false; };
            getNextChapter = function() { return false; };
        }
        ,"www.cococomic.com/manhua|www.99comic.com/manhua|mh.99770.cc/manhua":function()
        {
            getCurrentPage=function()
            {
                return parseInt(page, 10)-1;
            };
            getPageCount=function()
            {
                return datas;
            };
            getImgURL=function(thePage)
            {
                return ServerList[server-1]+arrPicListUrl[thePage];
            };
            setCurrentPage=function(thePage)
            {
                page = thePage+1;
            };
            getPageURL = function(thePage)
            {
                return '?v='+(thePage+1)+"*s="+server;
            };
            getPrevChapter = function() { return false; };
            getNextChapter = function() { return false; };
        }
        ,"*.178.com/*.shtml":function()
        {
            getCurrentPage=function()
            {
                return g_current_page-1;
            };
            getPageCount=function()
            {
                return arr_pages.length;
            };
            getImgURL=function(thePage)
            {
                return img_prefix+arr_pages[thePage];
            };
            setCurrentPage=function(thePage)
            {
                g_current_page = thePage+1;
            };
            getPageURL = function(thePage)
            {
                return generatePageUrl(g_page_base,thePage+1);
            };

            if (!_window._chapterInfo)
            {
                _window._chapterInfo={
                    prev:$_("prev_chapter")?{text:$_("prev_chapter").innerText, href:$_("prev_chapter").href}:false,
                    next:$_("next_chapter")?{text:$_("next_chapter").innerText, href:$_("next_chapter").href}:false};
            }

            getPrevChapter = function()
            {
                return _window._chapterInfo.prev;
            };
            getNextChapter = function()
            {
                return _window._chapterInfo.next;
            };
        }
        ,"comic.131.com/content/":function()
        {
            getCurrentPage=function()
            {
                return pageNum -1;
            };
            getPageCount=function()
            {
                return total;
            };
            getImgURL=function(thePage)
            {
                var url=getPageURL(thePage);
                var request = new XMLHttpRequest();
                request.open("GET", url, false);
                request.send();
                // request.responseText;
                return /<script.*?id="imgjs".*?src=".*?img=(.*?)"/.exec(request.responseText)[1]
            };
            setCurrentPage=function(thePage)
            {
                pageNum = thePage+1;
            };
            getPageURL = function(thePage)
            {
                return "http://comic.131.com/content/"+sid+"/"+bid+"/"+(thePage+1)+".html";
            };

            if (!_window._chapterInfo)
            {
                var chapterlinks = document.querySelectorAll(".mh_szwz2>div>span>a");
                _window._chapterInfo={
                    next:chapterlinks[2]?{ text:chapterlinks[2].innerText, href:chapterlinks[2].href }:false,
                    prev:chapterlinks[1]?{ text:chapterlinks[1].innerText, href:chapterlinks[1].href }:false
                };
            }

            getPrevChapter = function()
            {
                return _window._chapterInfo.prev;
            };
            getNextChapter = function()
            {
                return _window._chapterInfo.next;
            };
        }
        ,"comic.xxbh.net/*/*.html":function()
        {
            getCurrentPage=function()
            {
                return page -1;
            };
            getPageCount=function()
            {
                return maxPage ;
            };
            getImgURL=function(thePage)
            {
                return img_svr_eff+arr[thePage];
            };
            setCurrentPage=function(thePage)
            {
                page = thePage+1;
            };
            getPageURL = function(thePage)
            {
                return "?page="+(thePage+1);
            };

            getPrevChapter = function()
            {
                return preLink_b?{text:preName_b, href:preLink_b}:false;
            };
            getNextChapter = function()
            {
                return nextLink_b?{text:nextName_b, href:nextLink_b}:false;
            };
        }
        ,"*.xindm.cn/display.asp":function()
        {
            var PageCount= document.getElementsByName("page")[0].length;
            try {
                var CurrentPage = parseInt(location.search.match(/.*page=(\d*)/)[1], 10) -1;
                var UrlBase = location.href.replace((/page=\d*/),"");
            } 
            catch(e){
                var CurrentPage = 0;
                var UrlBase = location.href+"&";
            }

            getCurrentPage=function()
            {
                return CurrentPage;
            };
            getPageCount=function()
            {
                return PageCount;
            };
            getImgURL=function(thePage)
            {
                var url=getPageURL(thePage);
                //get the html
                var request = new XMLHttpRequest();
                request.open("GET", url, false);
                request.send();
                // request.responseText;
                var tmpDiv = document.createElement("div");
                tmpDiv.innerHTML=request.responseText;
                return tmpDiv.querySelector("table tbody tr td table tbody tr td table tbody tr td table tbody tr td img").src;

            };
            setCurrentPage=function(thePage)
            {
                CurrentPage = thePage;
            };
            getPageURL = function(thePage)
            {
                return UrlBase+"page="+(thePage+1);
            };

            getPrevChapter = function()
            {
                return false;
            };
            getNextChapter = function()
            {
                return false;
            };
        }
        // Add flyluo sites by Bingxin Chen
        ,"flyluo.com/showpic":function() {
            var url = _window.location.href;
            FLYLUO_PAGE = 0;
            croot = url;
            regx = (/<img(?:\s*\w*?\s*=\s*".+?")*?\s*src\s*=\s*"(.+?)"\s*name="myImage"(?:\s*\w*?\s*=\s*".+?")*\s*>/i);
            regx1 = (/\.\.\.(\d+)/);
            prevChapterRegx = /<a\shref="(.*?)"\sclass="viewnewsup">/;
            nextChapterRegx = /下一篇&nbsp;&nbsp;<a\shref="(.*?)">/;
            htmlSource = _document.documentElement.outerHTML;
            var nextChapterUrl = null;
            var prevChapterUrl = null;

            if((tmp=htmlSource.match(prevChapterRegx)) !== null) {
                tmpUrl = tmp[1];
                if ((/http:|https:/).test(tmpUrl))
                    prevChapterUrl = tmpUrl;
                else if ((/^\//).test(tmpUrl))
                    prevChapterUrl = 'http://www.flyluo.com'+tmpUrl;
                else 
                    prevChapterUrl = location.href.match(/.*\//)[0]+tmpUrl;
            }
            if((tmp=htmlSource.match(nextChapterRegx)) !== null) {
                tmpUrl = tmp[1];
                if ((/http:|https:/).test(tmpUrl))
                    nextChapterUrl = tmpUrl;
                else if ((/^\//).test(tmpUrl))
                    nextChapterUrl = 'http://www.flyluo.com'+tmpUrl;
                else 
                    nextChapterUrl = location.href.match(/.*\//)[0]+tmpUrl;
            }

            totalPage = parseInt(document.getElementsByTagName('html')[0].innerText.match(regx1)[1], 10);
            if(url.indexOf("-page-") > 0) {
                FLYLUO_PAGE = parseInt(url.substring(url.indexOf("-page-") + 6), 10)-1;
                croot = url.substring(0, url.indexOf("-page-")+6);
            } else 
                croot = url.substring(0, url.indexOf(".html"))+'-page-';

            getCurrentPage = function() {
                return FLYLUO_PAGE;
            };
            getPageCount = function() {
                return totalPage;
            };
            getImgURL = function(thePage) {
                proUrl = croot + (thePage+1) + ".html";
                var request = new XMLHttpRequest();
                request.open("GET", proUrl, false);
                request.send();
                return request.responseText.match(regx)[1];
            };
            setCurrentPage = function(thePage) {
                FLYLUO_PAGE = thePage + 1;
            };
            getPageURL = function(thePage)
            {
                return croot + (thePage + 1) + ".html";
            };
            getPrevChapter = function() { return prevChapterUrl ? {text:"", href:prevChapterUrl} : false; };
            getNextChapter = function() { return nextChapterUrl ? {text:"", href:nextChapterUrl} : false; };
            _document.onmousedown=null;
        }
        ,"www.dmeden.com/comichtml":function() {
            var PageCount = parseInt(document.getElementById("hdPageCount").value,10);
            var CurrentPage = parseInt(document.getElementById("hdPageIndex").value,10) -1;
            var __sID = document.getElementById("hdVolID").value;
            var __s = document.getElementById("hdS").value;
            getCurrentPage = function() {
                return CurrentPage;
            };
            getPageCount = function() {
                return PageCount;
            };
            getImgURL = function(thePage) {
                var request = new XMLHttpRequest();
                request.open("GET", getPageURL(thePage), false);
                request.send();
                return request.responseText.match(/id="imgCurr" src="(.*?)"/)[1];
            };
            setCurrentPage = function(thePage) {
                CurrentPage = thePage;
            };
            getPageURL = function(thePage) {
                return "../"+ __sID +"/"+ (thePage+1)  + ".html?s=" + __s;
            };
            getPrevChapter = function() { return false; };
            getNextChapter = function() { return false; };

        }
        ,"www.kkkmh.com/manhua":function(){
            getCurrentPage=function()
            {
                return current_page-1;
            };
            getPageCount=function()
            {
                return pic_num;
            };
            getImgURL=function(thePage)
            {
                return current_pic_server + hex2bin(pic[thePage])
            };
            setCurrentPage=function(thePage)
            {
                current_page = thePage+1;
            };
            getPageURL = function(thePage)
            {
                return url_info[0] + "?p=" + (thePage + 1);
            };

            var chapters={pre: false, next: false};

            Array.prototype.forEach.call($("chapter-func").getElementsByTagName("a"), function(aElement) {
                if (aElement.text === "下一章") {
                  chapters.next = {
                    text: aElement.title,
                    href: aElement.href
                  };
                } else if (aElement.text === "上一章") {
                  chapters.pre = {
                    text: aElement.title,
                    href: aElement.href
                  }
                }
            });

            getPrevChapter = function()
            {
              return chapters.pre;
            };
            getNextChapter = function()
            {
              return chapters.next;
            };
        }
        ,"/RedMangaReader":function() {
            var pageSearch = location.search;
            var current_page = 0;
            getCurrentPage=function()
            {
                return current_page;
            };
            getPageCount=function()
            {
                return pageCount;
            };
            getImgURL=function(thePage)
            {
                return "/getImage" + pageSearch + "&index=" + thePage;
            };
            setCurrentPage=function(thePage)
            {
                current_page = thePage;
            };
            getPageURL = function(thePage)
            {
                return "/RedMangaReader" + pageSearch;
            };

            getPrevChapter = function(){return false;};
            getNextChapter = function(){return false;};         
        }
    };

    // if (!_window.__iPadReaderInitialized)
    // {
    //     // _window.__iPadReaderInitialized = true;
    //     // push the pages to the
    //     for (var i=0;i<getPageCount();++i)
    //     {
    //         history.pushState(i,"Page "+(i+1), getPageURL(i));
    //     }
    //     _window.onpopstate=function(e)
    //     {
    //         c_page=e.state;
    //         div_imgs[c_page].focusMe();
    //     };
    // }

    var formatStr=function(str)
    {
        var arg = arguments;
        var index = 0;
        return str.replace((/%s/g), function(s)
            {
                ++index; 
                return arg[index] === undefined? s : arg[index];
            } );
    };
    var loc_RELOAD="Reload",
        loc_VERTICALWRITTING="Vertical Writting",
        loc_CURRENTPAGE="Current page:",
        loc_JUMPTOPAGE="Jump to page",
        loc_FIRSTPAGE="First page already",
        loc_LASTPAGE="Last page already",
        loc_NOPARSER="No support for this page, follwing pages only:\n%s",
        loc_NEXTCHAPTER="Next Chapter:<br/>%s",
        loc_PREVCHAPTER="Previous Chapter:<br/>%s",
        loc_NONEXTCHAPTER="No next chapter",
        loc_NOPREVCHAPTER="no previous chapter",
        loc_LANDSCAPEWARNING="Landscape mode only, <br/>please rotate your device!",
        loc_PORTRAITWARNING="Portrait mode only, <br/>please rotate your device!";

    var loc_RELOAD="重新载入",
        loc_VERTICALWRITTING="从右向左阅读",
        loc_CURRENTPAGE="当前页：",
        loc_JUMPTOPAGE="跳转到：",
        loc_FIRSTPAGE="已经是第一页了",
        loc_LASTPAGE="已经是最后一页了",
        loc_NOPARSER="不能处理该页面，阅读器仅能处理以下页面：\n%s",
        loc_NEXTCHAPTER="下一章:<br/>%s",
        loc_PREVCHAPTER="上一章:<br/>%s",
        loc_NONEXTCHAPTER="没有下一章节",
        loc_NOPREVCHAPTER="没有上一章节",
        loc_LANDSCAPEWARNING="本页面仅能在横向模式阅读，请旋转您的设备！",
        loc_PORTRAITWARNING="本页面仅能在纵向模式阅读，请旋转您的设备！",
        loc_ANIMATIONENABLE="平滑翻页",
        loc_ANIMATIONWARNING="注意：平滑翻页可能会造成您的Safari浏览器崩溃！\n您确定要打开平滑翻页功能吗？",
        loc_LOADING="载入中……长时间无反应请刷新页面重试",
        loc_PRELOADPAGENUM = "向后预载入页数：";


    var parserFound = false;
    for (var parser in parseEngine)
    {
        if (RegExp(parser.replace(/\.|\/|\*/g,function(e){return({".":"\.","/":"\/","*":".*"})[e];})).test(_window.location.href))
        {
            parserFound = true;
            parseEngine[parser]();
            break;
        }
    }
    if (!parserFound)
    {
        var parsers=[];
        for (var parser in parseEngine)
        {
            parsers.push.apply(parsers, parser.split("|"));
        }
        alert(formatStr(loc_NOPARSER, parsers.join("\n")));
        return;
    }

    var setConfig=function(itemName, itemValue)
    {
        configuration[itemName] = itemValue;
        localStorage.setItem("config", JSON.stringify(configuration));
    };

    // clear the images for more memory
    var emptyImageSrc="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIHWNgAAIAAAUAAY27m/MAAAAASUVORK5CYII=";
    var imgs = _document.getElementsByTagName("img");
    for(var i=0;i<imgs.length;++i)
        imgs[i].src = emptyImageSrc;

    if (!_window.oldTitle)
        oldTitle = _document.title;

    if (localStorage["ReaderDebug"] === "GenerateList")
    {
        var allImgs="";
        for (var i=0; i< getPageCount();++i)
        {
            
            var img = getImgURL(i), url;
            if ((/http:|https:/).test(img))
                url = img;
            else if ((/^\//).test(img))
                url = location.origin+img;
            else 
                url = location.href.match(/.*\//)[0]+img;
            allImgs += encodeURI(url)+ "<br/>";
        }
        // alert(allImgs);
        document.body.innerHTML = allImgs;
        return;
    }

    var AllLinks=_document.querySelectorAll("head>link"); 
    for(var i=0;i<AllLinks.length;++i) 
        _document.head.removeChild(AllLinks[i]);
    _document.body.style.cssText="margin:0;padding:0;text-align:center;";

    setTimeout(function(){
        if (!(/iPad/.test(navigator.userAgent))&&localStorage["ReaderDebug"]!=="debug")
        {
            m.content="width=device-width,initial-scale=1.0,maximum-scale=1.5,minimum-scale=0.25";
            _document.getElementsByTagName("head")[0].appendChild(m);
            _document.body.innerHTML="";
            for(i=0; i<getPageCount(); ++i)
            {
                var div_img=_document.createElement("div");
                div_img.style.cssText="visibility:hidden;position:absolute;left:0px;top:0px;";
                div_img.page=i;
                div_img.tImg=new Image();
                div_img.tImg.style.cssText="position:absolute;left:0px;top:0px;";
                div_img.appendChild(div_img.tImg);
                div_img.unloaded=true;
                div_img.eraseImg=function()
                {
                    if(!this.unloaded)
                    {
                        this.unloaded=true;
                        this.tImg.src=emptyImageSrc;
                    };
                };
                div_img.loadImg=function(focus)
                {
                    var _this=this;
                    var scrollToPos=function ()
                    {
                        if (VerticalWritting)
                        {
                            setTimeout(function(){ _window.scrollTo(_this.tImg.width-innerWidth,0); },0);
                        } else
                        {
                            setTimeout(function(){ _window.scrollTo(0,0); },0);
                        }

                    };
                    if(!this.unloaded)
                    {
                        if (focus)
                            scrollToPos();
                        return;
                    }
                    this.unloaded=false;
                    this.tImg.onload=function(){
                        if (focus)
                            scrollToPos();
                        this.onload=null;
                    };
                    setTimeout(function() {
                        if (!_this.tImg.flink)
                            _this.tImg.flink=getImgURL(_this.page);
                        _this.tImg.src=_this.tImg.flink;
                    } ,0);
                };
                div_img.focusMe=function()
                {
                    setCurrentPage(this.page);
                    div_imgs[this.page].style.visibility="visible";
                    div_imgs[this.page].loadImg(true);
                    for (var i=this.page+1; i<div_imgs.length;++i)
                    {
                        div_imgs[i].style.visibility="hidden";
                        if(i>this.page + configuration.PreloadPages)
                            div_imgs[i].eraseImg();
                        else 
                            div_imgs[i].loadImg(false);
                    };
                    for (var i=this.page-1; i>=0;--i)
                    {
                        div_imgs[i].style.visibility="hidden";
                        if(i<this.page-2)
                            div_imgs[i].eraseImg();
                        else 
                            div_imgs[i].loadImg(false);
                    };
                };
                _document.body.appendChild(div_img);
                div_imgs.push(div_img);
            };
            var nextImg=function()
            {
                ++c_page;
                if(c_page>=div_imgs.length)
                {
                    c_page=div_imgs.length-1;
                    alert("Last page already");
                }else 
                    // history.forward();
                    div_imgs[c_page].focusMe();
            };
            var preImg=function()
            {
                --c_page;
                if(c_page<0)
                {
                    c_page=0;
                    alert("First page already");
                }else 
                {
                    // history.back();
                    div_imgs[c_page].focusMe();
                }
            };
            _document.onmouseup=function(e) {
                // for Firefox
                if (e.target === _document.documentElement)
                    return;

                if(!e.offsetX) {
                    e.offsetX = e.layerX;
                    e.offsetY = e.layerY;
                }

                if (e.offsetX-scrollX < innerWidth/3)
                {
                    if (VerticalWritting)
                        nextImg();
                    else
                        preImg();
                } else if (e.offsetX-scrollX > innerWidth*2/3)
                {
                    if (VerticalWritting)
                        preImg();
                    else
                        nextImg();
                } else
                {
                    var p=parseInt(prompt("jump to 1-"+div_imgs.length+" page",c_page+1), 10);
                    if(p) {
                        if(p>div_imgs.length)
                            alert("maximum "+div_imgs.length+" pages!");
                        else {
                            c_page=p-1;
                            div_imgs[p-1].focusMe();
                        }
                    }
                }
            };
        }else
        {

            m.content="user-scalable=no,width=device-width,initial-scale=1.0,maximum-scale=1.0";
            _document.getElementsByTagName("head")[0].appendChild(m);
            _document.body.innerHTML="<div id=\"ReaderMain\" class=\"iReader\" style=\"opacity:0;left:0px;top:0px;-webkit-transition-duration:500ms;width:100%;height:100%;overflow:hidden;position:absolute;\">";
            setTimeout(function(){$_("ReaderMain").style.opacity=1;}, 0);

            var div_Images=_document.createElement("div");
            div_Images.style.cssText="display:table;text-align:center;background-color:#D6D6D6;font-size:25px;position:absolute;left:0px;top:0px;width:100%;height:100%;overflow-x:hidden;overflow-y:hidden;z-index:0;";
            div_Images.innerHTML = "<div style='display:table-cell;vertical-align:middle; text-align:center'>"+loc_LOADING+"</div>";

            $_("ReaderMain").appendChild(div_Images);

            for(i=0; i<getPageCount(); ++i)
            {
                var div_img=_document.createElement("div");
                div_img.style.cssText="background-color:white;visibility:hidden;position:absolute;left:0px;top:0px;width:100%;height:100%;overflow-x:hidden;overflow-y:hidden;";
                
                div_img.page=i;
                div_img.tImg=new Image();
                div_img.appendChild(div_img.tImg);
                div_img.loadingText = document.createElement("span");
                div_img.appendChild(div_img.loadingText);
                div_img.unloaded=true;
                div_img.eraseImg=function()
                {
                    if(!this.unloaded)
                    {
                        this.unloaded=true;
                        this.tImg.src=emptyImageSrc;
                    };
                };
                div_img.loadImg=function()
                {
                    var _this=this;
                    if(!this.unloaded)
                    {
                        if (!this.tImg.onload)
                        {
                            this.tImg.setTransform();
                        }
                        return;
                    }
                    this.unloaded=false;
                    this.tImg.onload=function()
                    {
                        if (localStorage["ReaderDebug"]==="debug")
                            console.info("img:w["+this.width+"] h["+this.height+"]:"+this.src);
                        if (this.width === 1 && this.height === 1)
                        {
                            setTimeout(function(){_this.tImg.onload();}, 50);
                            return;
                        };
                        this.setTransform();
                        this.onload=null;
                        // clear the page
                        for (var NodeIdx = _document.body.childNodes.length-1; NodeIdx >=0; --NodeIdx)
                        {
                            if (_document.body.childNodes[NodeIdx].className !== "iReader")
                                _document.body.removeChild(_document.body.childNodes[NodeIdx]);
                        }
                        // _this.style.backgroundColor="white";
                        // this.style.opacity= 1;
                        // _this.loadingText.innerHTML = "";
                        _this.style.opacity= 1;
                    };
                    this.tImg.setTransform = function()
                    {
                        if (this.unloaded)
                            return;
                        this.pageHeight = _window.innerHeight;
                        this.pageWidth=Math.floor(this.width * this.pageHeight / this.height);
                        if (this.height<10){
                            this.top=0;
                            this.left=0;
                        } else{
                            if (_this.setToRight ^ !VerticalWritting)
                                this.left=this.pageWidth<=_window.innerWidth?(_window.innerWidth-this.pageWidth)>>1:0;
                            else
                                this.left=this.pageWidth<=_window.innerWidth?(_window.innerWidth-this.pageWidth)>>1:_window.innerWidth-this.pageWidth;
                            this.top =0;
                        }
                        this.style.webkitTransform="translate("+ Math.ceil(this.left)+"px, "+Math.ceil(this.top)+"px)";
                    };
                    setTimeout(function() {
                        if (!_this.tImg.flink)
                            _this.tImg.flink=getImgURL(_this.page);
                        _this.tImg.src=_this.tImg.flink;
                    } ,0);
                    this.tImg.style.position="absolute";
                    this.tImg.style.left="0px";
                    this.tImg.style.top="0px";
                    this.tImg.style.width="auto";
                    this.tImg.style.height="100%";
                    this.tImg.left = this.tImg.top = 0;
                    this.tImg.setTransform();

                    this.style.opacity = 0.01;

                    // this.style.backgroundColor="#D6D6D6";
                    // this.tImg.style.opacity= 0;
                    // this.loadingText.innerHTML = loc_LOADING;
                };
                div_img.focusMe=function(setToRight)
                {
                    setCurrentPage(this.page);
                    $_("currentPage").innerHTML=(this.page+1)+"/"+getPageCount();
                    $_("PageJump").value=this.page;
                    // _document.title = (this.page+1)+"/"+getPageCount() + " " + oldTitle;
                    try{
                        history.pushState({},(this.page+1)+"/"+getPageCount() + " " + oldTitle, getPageURL(this.page));
                    }
                    catch(e){ }
                    _document.title = (this.page+1)+"/"+getPageCount() + " " + oldTitle;

                    div_imgs[this.page].style.visibility="visible";
                    div_imgs[this.page].setToRight = setToRight;
                    div_imgs[this.page].loadImg(true);

                    for (var i=this.page+1; i<div_imgs.length;++i)
                    {
                        div_imgs[i].style.visibility="hidden";
                        div_imgs[i].setToRight = false;
                        if(i>this.page + configuration.PreloadPages)
                            div_imgs[i].eraseImg();
                        else 
                            div_imgs[i].loadImg(false);
                    }
                    for (var i=this.page-1; i>=0;--i)
                    {
                        div_imgs[i].style.visibility="hidden";
                        div_imgs[i].setToRight = true;
                        if(i<this.page-2)
                            div_imgs[i].eraseImg();
                        else 
                            div_imgs[i].loadImg(false);
                    }

                    div_imgs[this.page].style.webkitTransform="translate(0px,0px)";

                    if (configuration.SmoothAnimation)
                        div_imgs[this.page].style.webkitTransitionProperty = "-webkit-transform";
                    if (this.page>0)
                        div_imgs[this.page-1].style.webkitTransform="translate(" + (VerticalWritting?100:-100) +"%,0px)";
                    if (this.page < div_imgs.length -1)
                        div_imgs[this.page+1].style.webkitTransform="translate(" + (VerticalWritting?-100:100) +"%,0px)";
                };

                div_img.tImg.addEventListener("webkitTransitionEnd",
                    function(){
                        // console.info("transitionEnd" + String(this.style.webkitTransitionProperty) );
                        this.style.webkitTransitionProperty = "none";
                    }, false );

                div_img.tImg.style.webkitTransitionDuration="300ms";
                div_img.tImg.style.webkitTransitionProperty = "none";
                div_img.tImg.style.webkitTransform="translate(0px,0px)";

                div_img.style.webkitTransitionDuration="300ms";
                div_img.style.webkitTransitionProperty = "none";
                div_img.style.webkitTransform="translate(0px,0px)";

                div_img.addEventListener("webkitTransitionEnd",
                    function(){
                        this.style.webkitTransitionProperty = "none";
                    }, false );

                div_postprocess(div_img);
                // $_("ReaderMain").appendChild(div_img);
                div_Images.appendChild(div_img);
                div_imgs.push(div_img);
            };
            var div_options=_document.createElement("div");
            // div_options.style.cssText="font-size:25px;visibility:hidden;position:absolute;left:0px;top:0px;width:"+__ScreenWidth+"px;height:"+__ScreenHeight+"px;overflow-x:hidden;overflow-y:hidden;z-index:10;background-color:rgba(0,0,0,0.6);";
            div_options.style.cssText="-webkit-transition-duration:300ms;font-size:25px;display:none;position:absolute;left:0px;top:0px;width:100%;height:100%;overflow-x:hidden;overflow-y:hidden;z-index:10;background-color:rgba(0,0,0,0.6);";
            div_options.enable = false;
            $_("ReaderMain").appendChild(div_options);
            div_options.innerHTML="<div id='_left_chapter_' style='display:table;font-size:25px;position:absolute;left:0px;top:0px;width:25%;height:100%;background-color:rgba(255,0,0,0.5);color:white;'>"+
                                   "<span id='_left_chapter_text_' style='vertical-align: middle; display: table-cell;' ></span></div>";
            div_options.innerHTML+="<div style=' display: table-cell; width: 50%; height: 100%; position: absolute; left: 25%;'>"+
            formatStr("<input type='button' id='Reload' style='font-size:25px;position:absolute;top:25%;left:30%;' value='%s' />" +
                "<label style='position:absolute;top:30%;left:20%;background-color:black;color:white;'>" +
                "<input  type='checkbox' id='VerticalWritting'/>%s</label>" +
                "<div style='font-size:25px;position:absolute;top:35%;left:20%;background-color:black;color:white'>" +
                "%s<span id='currentPage'></span></div>" +
                "<div style='font-size:25px;position:absolute;top:40%;left:20%;background-color:black;color:white;'>" + 
                "%s<select id='PageJump'></select></div>" + 
                "<label style='position:absolute;top:45%;left:20%;background-color:black;color:white;'>" +
                "<input  type='checkbox' id='AnimationEnable'/>%s</label>" +
                "<div style='font-size:25px;position:absolute;top:50%;left:20%;background-color:black;color:white;'>" + 
                "%s<select id='PreloadPages'></select></div>" ,
                loc_RELOAD,
                loc_VERTICALWRITTING,
                loc_CURRENTPAGE,
                loc_JUMPTOPAGE,
                loc_ANIMATIONENABLE,
                loc_PRELOADPAGENUM
            ) + "</div>";
            div_options.innerHTML+="<div id='_right_chapter_' style='display:table;font-size:25px;position:absolute;left:75%;top:0px;width:25%;height:100%;background-color:rgba(255,0,0,0.5);color:white;'>"+
                                   "<span id='_right_chapter_text_' style='vertical-align: middle; display: table-cell;' ></span></div>";
            div_options.innerHTML+="<div style='font-size:25px;position:absolute;top:90%;left:30%;background-color:black;color:white;'>Version 0.11.10.31.18</div>";

            div_options.addEventListener("webkitTransitionEnd", function(){this.style.display=this.enable?"inline":"none";}, false);

            var updateLeftRightPanel=function()
            {
                var nextChapter, nextChapterText, prevChapter, prevChapterText;
                if (VerticalWritting)
                {
                    nextChapter = $_("_left_chapter_");
                    nextChapterText = $_("_left_chapter_text_");
                    prevChapter= $_("_right_chapter_");
                    prevChapterText= $_("_right_chapter_text_");
                } else
                {
                    nextChapter = $_("_right_chapter_");
                    nextChapterText = $_("_right_chapter_text_");
                    prevChapter= $_("_left_chapter_");
                    prevChapterText= $_("_left_chapter_text_");
                }
                var next=getNextChapter();
                if (next)
                {
                    nextChapterText.innerHTML = formatStr(loc_NEXTCHAPTER, next.text);
                    nextChapter.onclick=function() { location.href = next.href; };
                    nextChapter.style.visibility = "visible";
                } else
                {
                    nextChapterText.innerHTML = "";//loc_NONEXTCHAPTER;
                    nextChapter.onclick=null;
                    nextChapter.style.visibility = "hidden";
                }
                var prev=getPrevChapter();
                if (prev)
                {
                    prevChapterText.innerHTML = formatStr(loc_PREVCHAPTER, prev.text);
                    prevChapter.onclick=function() { location.href = prev.href; };
                    prevChapter.style.visibility = "visible";
                } else
                {
                    prevChapterText.innerHTML = "";//loc_NOPREVCHAPTER;
                    prevChapter.onclick=null;
                    prevChapter.style.visibility = "hidden";
                }
            };
            $_("VerticalWritting").checked = VerticalWritting;
            $_("VerticalWritting").onclick=function()
            {
                VerticalWritting = !VerticalWritting;
                updateLeftRightPanel();
            };
            $_("Reload").onclick=function()
            {
                $___();
            };
            for(var i=0; i<getPageCount(); ++i)
            {
                var newoption=_document.createElement("option");
                newoption.innerHTML=i+1;
                newoption.value=i;
                // if (i === getCurrentPage())
                //     newoption.setAttribute("selected", "selected");
                $_("PageJump").appendChild(newoption);
            };
            $_("PageJump").onchange=function()
            {
                c_page = parseInt($_("PageJump").value , 10);
                div_imgs[c_page].focusMe();
                showOptionPanel(false);
            };
            $_("AnimationEnable").checked = !!configuration.SmoothAnimation;
            $_("AnimationEnable").onclick=function()
            {
                // if (this.checked)
                // {
                //     if (!confirm(loc_ANIMATIONWARNING))
                //         this.checked=false;
                // }
                setConfig("SmoothAnimation", this.checked);
            };


            for(var i=2; i <= MAXPRELOADPAGENUM; ++i)
            {
                var newoption=_document.createElement("option");
                newoption.innerHTML=i;
                newoption.value=i;
                // if (i === getCurrentPage())
                //     newoption.setAttribute("selected", "selected");
                $_("PreloadPages").appendChild(newoption);
            };
            $_("PreloadPages").value= configuration.PreloadPages;
            $_("PreloadPages").onchange=function()
            {
                var preloadpage = parseInt( $_("PreloadPages").value, 10);
                setConfig("PreloadPages", preloadpage);
                div_imgs[c_page].focusMe();
            };

            var showOptionPanel=function(show)
            {
                div_options.style.opacity = show? 0:1;
                div_options.style.display = "inline";
                div_options.enable = show;
                setTimeout(function(){div_options.style.opacity = div_options.enable?1:0;}, 0);
                if (show)
                {
                    // div_options.style.display= "inline";
                    updateLeftRightPanel();
                } else
                {
                    // div_options.style.display= "none";
                }
            };

            var div_rotationWarning = _document.createElement("div");
            div_rotationWarning.style.cssText="font-size:25px;visibility:hidden;position:absolute;display:table;left:0px;top:0px;width:100%;height:100%;overflow-x:hidden;overflow-y:hidden;z-index:20;background-color:rgba(0,0,0,0.6);";
            div_rotationWarning.innerHTML=formatStr("<div style='font-size:25px;position:relative;display:table-cell;vertical-align:middle; text-align:center'><div style='display:inline-block;background-color:black;color:white;'>%s</div></div>",
                Landscape?loc_LANDSCAPEWARNING:loc_PORTRAITWARNING);

            div_rotationWarning.className="iReader";
            _document.body.appendChild(div_rotationWarning);
            var checkRotation=function()
            {
                // if (!(/iPad/.test(navigator.userAgent)))
                //     return;
                var rightOrientation = true;
                if (_window.hasOwnProperty("orientation"))
                {
                    switch(_window.orientation)
                    {
                        case 0:
                        case 180:
                            rightOrientation = !Landscape;
                            break;
                        case 90:
                        case -90:
                            rightOrientation = Landscape;
                            break;
                    }
                }
                
                if (!rightOrientation)
                {
                    if (div_rotationWarning.style.visibility !== "visible")
                        div_rotationWarning.style.visibility = "visible";
                    div_rotationWarning.enable = true;
                } else
                {
                    if (div_rotationWarning.style.visibility !== "hidden")
                        div_rotationWarning.style.visibility = "hidden";
                    div_rotationWarning.enable = false;
                }
                window.scrollTo(0,0);
            };
            _window.onorientationchange=checkRotation;
            checkRotation();
            setInterval(checkRotation, 2500);

            _window.onresize=function()
            {
                for ( var i = 0; i<div_imgs.length; ++i)
                {
                    if ( div_imgs[i].tImg.setTransform) 
                        div_imgs[i].tImg.setTransform();
                }
            };


            var slideTowardRight=function()
            {
                if (div_imgs[c_page].tImg.pageWidth <= _window.innerWidth)
                    return false;
                if(div_imgs[c_page].setToRight^VerticalWritting)
                {
                    div_imgs[c_page].setToRight = VerticalWritting;
                    div_imgs[c_page].tImg.setTransform();

                    if (configuration.SmoothAnimation)
                        div_imgs[c_page].tImg.style.webkitTransitionProperty = "-webkit-transform";

                    return true;
                };
                return false;
            };
            var slideTowardLeft=function()
            {
                if (div_imgs[c_page].tImg.pageWidth <= _window.innerWidth)
                    return false;
                if(div_imgs[c_page].setToRight^!VerticalWritting)
                {
                    // div_imgs[c_page].tImg.left=_window.innerWidth-div_imgs[c_page].tImg.pageWidth;
                    div_imgs[c_page].setToRight = !VerticalWritting;
                    div_imgs[c_page].tImg.setTransform();
                    if (configuration.SmoothAnimation)
                        div_imgs[c_page].tImg.style.webkitTransitionProperty = "-webkit-transform";
                    return true;
                };
                return false;
            };

            var preImg=function()
            {

                if (VerticalWritting)
                {
                    if (slideTowardLeft())
                        return;
                } else
                {
                    if (slideTowardRight())
                        return;
                };
                --c_page;
                if(c_page<0)
                {
                    c_page=0;
                    // alert(loc_FIRSTPAGE);
                    showOptionPanel(true);
                }else 
                {
                    div_imgs[c_page].focusMe(true);
                    if (configuration.SmoothAnimation)
                    {
                        div_imgs[c_page+1].style.webkitTransitionProperty = "-webkit-transform";
                        div_imgs[c_page+1].style.visibility="visible";
                    }
                    // history.back();
                };
            };
            var nextImg=function()
            {
                if (VerticalWritting)
                {
                    if (slideTowardRight())
                        return;
                } else
                {
                    if (slideTowardLeft())
                        return;
                }
                ++c_page;
                if(c_page>=div_imgs.length)
                {
                    c_page=div_imgs.length-1;
                    // alert(loc_LASTPAGE);
                    showOptionPanel(true);
                }else 
                {
                    // history.forward();
                    div_imgs[c_page].focusMe();
                    if (configuration.SmoothAnimation)
                    {
                        div_imgs[c_page-1].style.webkitTransitionProperty = "-webkit-transform";
                        div_imgs[c_page-1].style.visibility="visible";
                    }
                }
            };

            var ImageclickAt=function(x, target)
            {
                if (div_rotationWarning.enable)
                    return;

                if(x<_window.innerWidth/4)
                {
                    if (VerticalWritting)
                        nextImg();
                    else
                        preImg();
                }
                else if (x>_window.innerWidth*3/4)
                {
                    if (VerticalWritting)
                        preImg();
                    else
                        nextImg();
                }
                else
                {
                    showOptionPanel(true);
                }
                return false;

            };

            var OptionclickAt=function(x, target)
            {
                if (div_rotationWarning.enable)
                    return;
                if (target.tagName === "DIV")
                {
                    showOptionPanel(false);
                    return false;
                }
            };

            if(navigator.userAgent.indexOf("iPad")!=-1 || navigator.userAgent.indexOf("Android")!=-1)
            {
                div_Images.ontouchstart =function(e) { return ImageclickAt(e.touches[0].pageX, e.target); };
                div_options.ontouchstart =function(e) { return OptionclickAt(e.touches[0].pageX, e.target); };
            }
            else
            {
                div_Images.onmousedown=function(e) { ImageclickAt(e.pageX, e.target); };
                div_options.onmousedown=function(e) { OptionclickAt(e.pageX, e.target); };
            };

        };

        c_page=getCurrentPage();
        div_imgs[c_page].focusMe();

        // c_page=getCurrentPage();
        // if (!_window.__iPadReaderInitialized)
        // {
        //     _window.__iPadReaderInitialized = true;
        //     var pageDelta = c_page - (getPageCount() -1);
        //     if (pageDelta != 0)
        //         history.go(pageDelta)
        //     else
        //         div_imgs[c_page].focusMe();
        // }else
        //     div_imgs[c_page].focusMe();
    },0);
})();
