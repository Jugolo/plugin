/*
This is a system plugin. It means it has more access end normally plugin.
This plugin handle the job to controle update for plugin. It will also update a plugin if it is meaning!
*/

function getData(list){
 var r = {};
 for(var i=0;i<list.length;i++){
    r[list[i].name] = list[i];
 }

 return r;
}

cronwork("plugin.controler", function(){
  //this should only be allowed when config 'PLUGIN_AUTO_UPDATE' is set to 'true'
  if(config("PLUGIN_AUTO_UPDATE") !== "true"){
    return;//dont run the list.
  }
  var html = new Http("https://api.github.com/repos/Jugolo/Plugin/contents/");
  var data = getData(JSON.parse(html.exec().toString()));
  var dir = new DirList("include/plugin/");
  var current = "";
  while(current = dir.next(false)){
    if(current.isDir() && typeof data[current.name()] !== "undefined" && data[current.name()].sha != current.sha1()){
       update(current.name());//update is php function there take the name and get file from github.
       //next version should probably allow this file do the same work as php. But for now it work
    }
  }
}, "1d");//do it every day (24 hours interval)
