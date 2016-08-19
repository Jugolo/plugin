//access function is a function there tell the system it should have access to specifk item(item there is not standart ex database)
access("database", function(){return "The plugin "suggestion" need access to database connection. Else it will not work probely";});

function getCachedCID(uid){
   var query = database().query("SELECT `cid` FROM "+database().table("suggestion")+" WHERE `uid`='"+uid+"'");
   var buffer = [];
   var row;
   while(row = query.fetch()){
     buffer.push(row["cid"]);
   }

   return buffer;
}

function calculate(cid, not){
   
}

function getTopTen(uid){
  var cached = [];
  //get all message in the cached channels 
  var query = database().query("SELECT m.message FROM "+database().table("message")+" AS m LEFT JOIN "+database().table("suggestion")+" AS s ON m.cid=s.cid WHERE s.uid='"+uid+"'");
  var row; 
  while(row = query.fetch()){
    cached.push(row["message"]);
  }

  //if cached is empty return empty array
  if(cached.length == 0){
    return [];
  }

  var results = {};

  //run all channel where the user has not been!
  query = database().query("SELECT m.message, c.name FROM "+database().table("message")+" AS m LEFT JOIN "+database().table("suggestion")+" AS s ON m.cid<>s.cid LEFT JOIN "+database().table("channel")+" AS c ON c.id=s.cid WHERE s.uid='"+uid+"'");
  while(row = query.fetch()){
    //controle if wee got the channel in results
    if(typeof results[row["name"]] === "undefined"){
      results[row["name"]] = [0, 0];
    }

    results[row["name"]][0]++;
    results[row["name"]][1] += calculate(cached, row["message"]);
  }
}

function calculate(cache, msg){

}

//server.start.join is a event there is bean called every time a user joined a standart channels
event("server.start.join", function(user, channel){
   //let us build a part of sql so the cached channel is not in the query
   var result = getTopTen(user.id());
   if(result.length == 0){
     return;//no offer to give the user
   }
});
