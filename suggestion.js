//access function is a function there tell the system it should have access to specifk item(item there is not standart ex database)
access("database", function(){return "The plugin "suggestion" need access to database connection. Else it will not work probely";});

function similar_text (first, second, percent) { // eslint-disable-line camelcase
  //  discuss at: http://locutus.io/php/similar_text/
  // original by: Rafał Kukawski (http://blog.kukawski.pl)
  // bugfixed by: Chris McMacken
  // bugfixed by: Jarkko Rantavuori original by findings in stackoverflow (http://stackoverflow.com/questions/14136349/how-does-similar-text-work)
  // improved by: Markus Padourek (taken from http://www.kevinhq.com/2012/06/php-similartext-function-in-javascript_16.html)
  //   example 1: similar_text('Hello World!', 'Hello locutus!')
  //   returns 1: 8
  //   example 2: similar_text('Hello World!', null)
  //   returns 2: 0

  if (first === null ||
    second === null ||
    typeof first === 'undefined' ||
    typeof second === 'undefined') {
    return 0
  }

  first += ''
  second += ''

  var pos1 = 0
  var pos2 = 0
  var max = 0
  var firstLength = first.length
  var secondLength = second.length
  var p
  var q
  var l
  var sum

  for (p = 0; p < firstLength; p++) {
    for (q = 0; q < secondLength; q++) {
      for (l = 0; (p + l < firstLength) && (q + l < secondLength) && (first.charAt(p + l) === second.charAt(q + l)); l++) { // eslint-disable-line max-len
        // @todo: ^-- break up this crazy for loop and put the logic in its body
      }
      if (l > max) {
        max = l
        pos1 = p
        pos2 = q
      }
    }
  }

  sum = max

  if (sum) {
    if (pos1 && pos2) {
      sum += similar_text(first.substr(0, pos1), second.substr(0, pos2))
    }

    if ((pos1 + max < firstLength) && (pos2 + max < secondLength)) {
      sum += similar_text(
        first.substr(pos1 + max, firstLength - pos1 - max),
        second.substr(pos2 + max,
        secondLength - pos2 - max))
    }
  }

  if (!percent) {
    return sum
  }

  return (sum * 200) / (firstLength + secondLength)
}

function getCachedCID(uid){
   var query = database().query("SELECT `cid` FROM "+database().table("suggestion")+" WHERE `uid`='"+uid+"'");
   var buffer = [];
   var row;
   while(row = query.fetch()){
     buffer.push(row["cid"]);
   }

   return buffer;
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

  var fin = [];

  for(var name in results){
     fin[] = [name, results[name][1]/results[name][0]];
  }

  return fin.sort(function(current, next){
     return current[1]-next[1];
  }).slice(0, (fin.length > 10 ? 10 : fin.length));
}

function calculate(cache, msg){
   var index = 0;
   for(var i=0;i<cache.length;i++){
      index += similar_text(cache[i], msg);
   }

   return index / cache.length;
}

//server.start.join is a event there is bean called every time a user joined a standart channels
event("server.start.join", function(user, channel){
   //let us build a part of sql so the cached channel is not in the query
   var result = getTopTen(user.id());
   if(result.length == 0){
     return;//no offer to give the user
   }

  var end = [];
  //wee make the string
  for(var i=0;i<result.length;i++){
    end.push(result[i][0]);
  }
  //send_raw is function there send a message to the current user. It do not append anythink to it
  send_raw("SUGGEGSTION: "+end.join(","));
});

event("server.channel.join", function(user, channel){
  //wee create the cache to furthere use
  database().insert("suggestion", {
    "uid" : user.id(),
    "cid" : channel.id()
  });
});

event("server.channel.leave", function(user, channel){
   //wee remove it from the cache
   database().query("DELETE FROM "+database().table("suggestion")+" WHERE `cid`='"+channel.id()+"' AND `uid`='"+user.id()+"'");
});

//cronwork to garbage_collect. It will remove all channel there is not exists anymore. 
cronwork("suggestion.garbage_collect", function(){
  database().query("DELETE FROM "+database().table("suggestion")+" AS s LEFT JOIN "+database().query("channel")+" AS c ON c.cid<>c.id");
}, 24);//do every 24 hours
