///<reference path="../lib/node.d.ts"/>
"use strict";


module htmlTemplate {
  var mainhtml = "<!doctype html>"+
                 "<html>" +
                 "<head>" +
                 '<meta charset="utf-8">'+
                 "</head>" +
                 "<body> %body%</body>" +
                 "</html>";

  var browserPage = mainhtml.replace("%body%", 
    "<p> %title% </p>" +
    "<ul> %dir% </ul>" +
    "<p></p>" +
    "<ul> %files% </ul>");
  var mangaPage = mainhtml.replace("%body%", 
    "<script>var pageCount = %pagecount%;</script>"+
    '<script src="/reader.js"></script>'
  );
  export function buildBrowserPage(template: {title: string; dir:string; files:string;}):string {
    return browserPage.replace("%title%", template.title).replace("%dir%", template.dir).replace("%files%" , template.files);
  }
  export function buildMangaPage(template: { pagecount:number; }):string {
    return mangaPage.replace("%pagecount%", ""+template.pagecount);
  }
}



module main {

  import fs = module("fs");

  interface archiveFile{
    name: string;
    content: any;
  }

  class ArchiveLoader {
    __fdFile : string;
    fileName: string;
    constructor(archiveName: string) {
      this.fileName = archiveName;
      this.__fdFile = fs.openSync( archiveName, "r");
    }
    __fileRead( offset: number, length: number): NodeBuffer {
      var buf = new Buffer(length);
      fs.readSync( this.__fdFile, buf, offset, length, 0);
      return buf;
    }
    getFileList():archiveFile[]{
      return [];
    }
    getFileByIndex(index:number):NodeBuffer{
      return new Buffer(0);
    }
    close():void{
      fs.closeSync( this.__fdFile );
    }
    static __loaders:any = {}; // map is not supported by TypeScript!
    static registerLoader(ext:string, loader: new(archiveName:string)=>ArchiveLoader){
      ArchiveLoader.__loaders[ ext ] = loader;
    }
    static createFileLoader(ext:string, fileName:string) {
      return new ArchiveLoader.__loaders[ext]( fileName );
    }
  };


  import http = module("http");
  import url = module("url");
  var jszip = require("node-zip");

  class ZipLoader extends ArchiveLoader{
    zip = null;
    files:archiveFile[] = [];
    constructor( zipName: string) {
      super(zipName);
      // this.zip = jszip( this.__fileRead(0, fs.fstatSync(this.__fdFile).size).toString("binary"));
      this.zip = jszip( this.__fdFile );

      this.files = this.zip.zipEntries.files
      .reduce((arr, file)=>{
          var imageExt = /\.(jpg|jpeg|png|gif)$/i;
          if (imageExt.test(file.fileName)) {
            arr.push({
                name: file.fileName,
                content: file
            });
          };
          return arr;
      }, [])
      .sort( (fileA, fileB)=>{
          return (fileA.name> fileB.name) ? 1 : (fileA.name< fileB.name)? -1 :0 ;
      });
    }
    getFileList(){
      return this.files;
    }
    getFileByIndex( index: number): NodeBuffer {
      return new Buffer( this.zip.zipEntries.readLocalFile( this.files[index].content ), "binary" );
    }
    close(){}
  };
  ArchiveLoader.registerLoader("zip", ZipLoader);


  var archiveLoader: ArchiveLoader;
  var loadArchive = (query) => {
    if ( archiveLoader && archiveLoader.fileName !== query.file ) {
      archiveLoader.close();
      archiveLoader = undefined;
    };
    if (!archiveLoader) {
      archiveLoader = ArchiveLoader.createFileLoader(query.type.toLocaleLowerCase(), query.file);
    }
  };

  var serverProcessor = {
    '/list' : function( query, res) {
      var dirs = [];
      var zipfiles = [];

      if ( !query.dir ) {
        if (process.platform === 'win32') {
          for (var c=67; c<=90; ++c) {
            try{
              fs.readdirSync(String.fromCharCode(c) + ":/");
              dirs.push({name: String.fromCharCode(c) + ":/" , path: String.fromCharCode(c) + ":/" });
            }catch(e){};
          }
          query.dir = "";
        } else {
          query.dir = "/";
        }
      }
      if ( query.dir !== "" ) {
        var allfiles = fs.readdirSync( query.dir );
        for (var i in allfiles) {
          var filepath = query.dir + allfiles[i];
          try{
            if ( fs.statSync( filepath ).isDirectory() ) {
              dirs.push( { name: allfiles[i], path: filepath + "/"} );
            }
            if ( fs.statSync( filepath).isFile() ) {
              if (/\.zip$/.test(filepath) ) {
                zipfiles.push( { type: "zip", name: allfiles[i], path: filepath } );
              } 
            }
          }catch(e){};

        }
      }

      var lis = "";

      for (var i in dirs) {
        lis += '<li><a href="/list?dir=' +  encodeURIComponent( dirs[i].path ) + '">'+ dirs[i].name +'</a>';
      }

      var filelis = "";
      for (var i in zipfiles) {
        filelis += '<li><a target="_blank" href="/RedMangaReader?file=' +  encodeURIComponent( zipfiles[i].path ) + '&type='+ encodeURIComponent( zipfiles[i].type ) +'">'+ zipfiles[i].name +'</a>';
      }

      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(htmlTemplate.buildBrowserPage(
          {
            title: query.dir,
            dir: lis,
            files: filelis
      }));

      //  		res.end('No file found on this directory\n');
    },
    '/RedMangaReader': function( query, res ){
      try{
        loadArchive( query);
      } catch (e) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end("Internal Error: \n" + e );
        return;
      }

      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end( htmlTemplate.buildMangaPage( { pagecount: archiveLoader.getFileList().length }) );
    },
    '/getImage':function(query, res) {
      try {
        loadArchive( query);
        var fileContent = archiveLoader.getFileByIndex(query.index);
      } catch(e) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end("Internal Error: \n" + e );
        return;
      }

      res.writeHead(200, {'Content-Type': 'image'});
      res.end( fileContent ) ;
    },
    '/reader.js': function(query, res) {
      res.writeHead(200, {'Content-Type': 'application/javascript'});
      res.end( fs.readFileSync("./lib/Reader.js") );
    },
    'default': function (query, res) {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('internal error\n');
    }
  }


  http.createServer(function (req, res) {

      var reqmap = url.parse( req.url, true );
      console.log(req.url);
      var processor = serverProcessor[reqmap.pathname] || serverProcessor[reqmap.pathname]
      if ( !serverProcessor[reqmap.pathname] ) {
        if ( reqmap.pathname === "" || reqmap.pathname === "/" ) {
          reqmap.pathname = "/list";
          delete reqmap.query.dir;
        } else {
          reqmap.pathname = "default";
        }
      }
      serverProcessor[reqmap.pathname](reqmap.query, res);

  }).listen(808, '0.0.0.0');


  console.log('Server running at http://127.0.0.1:808/');

}
