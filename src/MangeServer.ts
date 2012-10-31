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
  import http = module("http");
  import url = module("url");
  import fs = module("fs");
  var jszip = require("node-zip");

  var zipFile:any = {
    path: "",
    zip: null,
    files:[]
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
        lis += '<li><a href="list?dir=' +  encodeURIComponent( dirs[i].path ) + '">'+ dirs[i].name +'</a>';
      }

      var filelis = "";
      for (var i in zipfiles) {
        filelis += '<li><a target="_blank" href="RedMangaReader?file=' +  encodeURIComponent( zipfiles[i].path ) + '&type='+ encodeURIComponent( zipfiles[i].type ) +'">'+ zipfiles[i].name +'</a>';
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
      res.writeHead(200, {'Content-Type': 'text/html'});
      loadFile( query );
      res.end(

        htmlTemplate.buildMangaPage( { pagecount: zipFile.files.length }));

    },
    '/getImage':function(query, res) {
      res.writeHead(200, {'Content-Type': 'image'});
      loadFile(query);
      res.end( new Buffer(zipFile.zip.zipEntries.readLocalFile(zipFile.files[query.index]), "binary") );

    },
    '/reader.js': function(query, res) {
      res.writeHead(200, {'Content-Type': 'application/javascript'});
      res.end( fs.readFileSync("./lib/Reader.js") );
    },
    'default': function (res) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Hello World\n');
    }
  }

  function loadFile( query ) {
    var imageExt = /\.(jpg|jpeg|png|gif)$/i;

    if ( query.type === "zip" ) {
      if (zipFile.path !== query.file) {
        zipFile.path = query.file;
        zipFile.zip = jszip( fs.readFileSync(query.file).toString("binary"));
        zipFile.files = zipFile.zip.zipEntries.files.slice(0);
        zipFile.files = zipFile.files.filter(function(a){return  imageExt.test(a.fileName) ;})
        zipFile.files.sort(function(a,b){return (a.fileName > b.fileName) ? 1 : (a.fileName < b.fileName)? -1:0;});
      }
    };

  }

  http.createServer(function (req, res) {

      var reqmap = url.parse( req.url, true );
      if (serverProcessor[reqmap.pathname]) {
        serverProcessor[reqmap.pathname](reqmap.query, res);
      } else {
        serverProcessor['default'](res);
      }


  }).listen(808, '0.0.0.0');


  console.log('Server running at http://127.0.0.1:808/');

}
