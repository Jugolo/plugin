/*
This is a system plugin. It means it has more access end normally plugin.
This plugin handle the job to controle update for plugin. It will also update a plugin if it is meaning!
*/

cronwork("plugin.controler", function(){
  var html = new Http("https://api.github.com/repos/Jugolo/Plugin/contents/");
}, "1d);//do it every day (24 hours interval)
