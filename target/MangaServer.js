var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
"use strict";
var htmlTemplate;
(function (htmlTemplate) {
    var mainhtml = "<!doctype html>" + "<html>" + "<head>" + '<meta charset="utf-8">' + "</head>" + "<body> %body%</body>" + "</html>";
    var browserPage = mainhtml.replace("%body%", "<p> %title% </p>" + "<ul> %dir% </ul>" + "<p></p>" + "<ul> %files% </ul>");
    var mangaPage = mainhtml.replace("%body%", "<script>var pageCount = %pagecount%;</script>" + '<script src="/reader.js"></script>');
    function buildBrowserPage(template) {
        return browserPage.replace("%title%", template.title).replace("%dir%", template.dir).replace("%files%", template.files);
    }
    htmlTemplate.buildBrowserPage = buildBrowserPage;
    function buildMangaPage(template) {
        return mangaPage.replace("%pagecount%", "" + template.pagecount);
    }
    htmlTemplate.buildMangaPage = buildMangaPage;
})(htmlTemplate || (htmlTemplate = {}));

var main;
(function (main) {
    var fs = require("fs")
    var ArchiveLoader = (function () {
        function ArchiveLoader(archiveName) {
            this.fileName = archiveName;
            this.__fdFile = fs.openSync(archiveName, "r");
        }
        ArchiveLoader.prototype.__fileRead = function (offset, length) {
            var buf = new Buffer(length);
            fs.readSync(this.__fdFile, buf, offset, length, 0);
            return buf;
        };
        ArchiveLoader.prototype.getFileList = function () {
            return [];
        };
        ArchiveLoader.prototype.getFileByIndex = function (index) {
            return new Buffer(0);
        };
        ArchiveLoader.prototype.close = function () {
            fs.closeSync(this.__fdFile);
        };
        ArchiveLoader.__loaders = {
        };
        ArchiveLoader.registerLoader = function registerLoader(ext, loader) {
            ArchiveLoader.__loaders[ext] = loader;
        }
        ArchiveLoader.createFileLoader = function createFileLoader(ext, fileName) {
            return new ArchiveLoader.__loaders[ext](fileName);
        }
        return ArchiveLoader;
    })();    
    ; ;
    var http = require("http")
    var url = require("url")
    var jszip = require("node-zip");
    var ZipLoader = (function (_super) {
        __extends(ZipLoader, _super);
        function ZipLoader(zipName) {
                _super.call(this, zipName);
            this.zip = null;
            this.files = [];
            this.zip = jszip(this.__fdFile);
            this.files = this.zip.zipEntries.files.reduce(function (arr, file) {
                var imageExt = /\.(jpg|jpeg|png|gif)$/i;
                if(imageExt.test(file.fileName)) {
                    arr.push({
                        name: file.fileName,
                        content: file
                    });
                }
                ; ;
                return arr;
            }, []).sort(function (fileA, fileB) {
                return (fileA.name > fileB.name) ? 1 : (fileA.name < fileB.name) ? -1 : 0;
            });
        }
        ZipLoader.prototype.getFileList = function () {
            return this.files;
        };
        ZipLoader.prototype.getFileByIndex = function (index) {
            return new Buffer(this.zip.zipEntries.readLocalFile(this.files[index].content), "binary");
        };
        ZipLoader.prototype.close = function () {
        };
        return ZipLoader;
    })(ArchiveLoader);    
    ; ;
    ArchiveLoader.registerLoader("zip", ZipLoader);
    var archiveLoader;
    var loadArchive = function (query) {
        if(archiveLoader && archiveLoader.fileName !== query.file) {
            archiveLoader.close();
            archiveLoader = undefined;
        }
        ; ;
        if(!archiveLoader) {
            archiveLoader = ArchiveLoader.createFileLoader(query.type.toLocaleLowerCase(), query.file);
        }
    };
    var serverProcessor = {
        '/list': function (query, res) {
            var dirs = [];
            var zipfiles = [];
            if(!query.dir) {
                if(process.platform === 'win32') {
                    for(var c = 67; c <= 90; ++c) {
                        try  {
                            fs.readdirSync(String.fromCharCode(c) + ":/");
                            dirs.push({
                                name: String.fromCharCode(c) + ":/",
                                path: String.fromCharCode(c) + ":/"
                            });
                        } catch (e) {
                        }
                        ; ;
                    }
                    query.dir = "";
                } else {
                    query.dir = "/";
                }
            }
            if(query.dir !== "") {
                var allfiles = fs.readdirSync(query.dir);
                for(var i in allfiles) {
                    var filepath = query.dir + allfiles[i];
                    try  {
                        if(fs.statSync(filepath).isDirectory()) {
                            dirs.push({
                                name: allfiles[i],
                                path: filepath + "/"
                            });
                        }
                        if(fs.statSync(filepath).isFile()) {
                            if(/\.zip$/.test(filepath)) {
                                zipfiles.push({
                                    type: "zip",
                                    name: allfiles[i],
                                    path: filepath
                                });
                            }
                        }
                    } catch (e) {
                    }
                    ; ;
                }
            }
            var lis = "";
            for(var i in dirs) {
                lis += '<li><a href="/list?dir=' + encodeURIComponent(dirs[i].path) + '">' + dirs[i].name + '</a>';
            }
            var filelis = "";
            for(var i in zipfiles) {
                filelis += '<li><a target="_blank" href="/RedMangaReader?file=' + encodeURIComponent(zipfiles[i].path) + '&type=' + encodeURIComponent(zipfiles[i].type) + '">' + zipfiles[i].name + '</a>';
            }
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.end(htmlTemplate.buildBrowserPage({
                title: query.dir,
                dir: lis,
                files: filelis
            }));
        },
        '/RedMangaReader': function (query, res) {
            try  {
                loadArchive(query);
            } catch (e) {
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                res.end("Internal Error: \n" + e);
                return;
            }
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.end(htmlTemplate.buildMangaPage({
                pagecount: archiveLoader.getFileList().length
            }));
        },
        '/getImage': function (query, res) {
            try  {
                loadArchive(query);
                var fileContent = archiveLoader.getFileByIndex(query.index);
            } catch (e) {
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                res.end("Internal Error: \n" + e);
                return;
            }
            res.writeHead(200, {
                'Content-Type': 'image'
            });
            res.end(fileContent);
        },
        '/reader.js': function (query, res) {
            res.writeHead(200, {
                'Content-Type': 'application/javascript'
            });
            res.end(fs.readFileSync("./lib/Reader.js"));
        },
        'default': function (query, res) {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end('internal error\n');
        }
    };
    http.createServer(function (req, res) {
        var reqmap = url.parse(req.url, true);
        console.log(req.url);
        var processor = serverProcessor[reqmap.pathname] || serverProcessor[reqmap.pathname];
        if(!serverProcessor[reqmap.pathname]) {
            if(reqmap.pathname === "" || reqmap.pathname === "/") {
                reqmap.pathname = "/list";
                delete reqmap.query.dir;
            } else {
                reqmap.pathname = "default";
            }
        }
        serverProcessor[reqmap.pathname](reqmap.query, res);
    }).listen(808, '0.0.0.0');
    console.log('Server running at http://127.0.0.1:808/');
})(main || (main = {}));

