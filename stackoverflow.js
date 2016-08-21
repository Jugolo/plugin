access("conf_file");
access("http");

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
  var data = JSON.parse(con.toString ());
}, "1m");
