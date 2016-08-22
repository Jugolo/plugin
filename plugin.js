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

function getTree(path){
  var path = new DirList(path);
  var item;
  var r = {};
  while(item = path.next(false)){
    r[item.name()] = (item.isDir() ? getTree(item.path()) : "file");
  }

  return r;
}

function getFileContext(url){
  var http = new Http(url);
  var json = JSON.parse(http.exec().toString());

  switch(json.encoding){
    case "base64":
      return base64_decode(json.content);
    default:
      throw "Unexpected encoding "+json.encoding;
  }
}

function getFiles(data){
  var r = {};

  for(var i=0;i<data.length;i++){
    r[data[i].name] = {
      "type" : data[i].type,
      "context" : (data[i].type == "file" ? getFileContext(data["_links"].self) : getFiles(JSON.parse(new Http(data["_links"].self).exec().toString())))
    };
  }

  return r;
}

function update(data, path){
  //wee get the data from this plugin
  var query = database().query("SELECT * FROM "+table("event")+" WHERE `type`='plugin' AND `name`="+database().clean(data.name));
  var row = query.fetch();
  //if the data is not in the table do not do anything. It is not installed! Or if auto update is false
  if(row == null || row["auto_update"] !== "true"){
    return;
  }

  //let us get the list of wich file there are in the dir
  var html = new Http(data["_links"].self);
  var files = getFiles(JSON.parse(html.exec().toString()));
  
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
       update(data[current.name()], current.path());
    }
  }
}, "1d");//do it every day (24 hours interval)
