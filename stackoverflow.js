access("conf_file");
access("http");
useNick("stackoverflow");

cronwork("stackoverflow.update", function(){
  if(!conf_file_exists("last_updatet")){
     //create it and wait 1 min
     conf_file_create("last_updatet", new Date().getTime());
     return;
  }

  //wee get last update
  var update = conf_file_get("last_updatet");
  config_file_create("last_updatet", new Date().getTime());
  var query = "https://api.stackexchange.com/2.2/questions?fromdate="+update+"&order=desc&sort=creation&site=stackoverflow";
  var con = new Http(query);
  var data = JSON.parse(con.toString());
  run(data["items"]);
}, "1m");

function run(item){
  for(var i=0;i<items.length;i++){
     //wee run tags and see if it is valid
     for(var t=0;t<items[i].tags.length;t++){
       var chan = "";
       if((chan = parseChannel(items[i].tags[i])) != null){
         send_channel(chan, "[url="+items[i].link+"]"+items[i].title+"[/url]");
       }
     }
  }
}

function parseChannel(chan){
  if(parseChar(chan)){
    var chan = "#"+chan;
    if(chan_exsist(chan)){
      return chan;
    }
  }
  return null;
}

function parseChar(chan){
  for(var i=0;i <chan.length;i++){
     var char = chan.charCodeAt(i);
     if(char <= 65 && char >= 90 && char <= 97 && char >= 122){
       return false
     }
  }

  return true;
}
