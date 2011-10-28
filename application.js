var App = {};
App.templates = {};
App.methods = {};

App.methods.list = function(lines) {
  var template = _.template($("#list-template").html());
  for (var i = 0; i < lines.length; i++) {
    /* Is this a list item ?*/
    if(lines[i].match(/^\s*- ([^\n]+)/)){
      var matches = [lines[i].replace(/^\s*- /, "")];
      for (i = (i + 1); i < lines.length; i++) {
        if(lines[i].match(/^\s*- ([^\n]+)/)){
          matches.push(lines[i].replace(/^\s*- /, ""));
        } else {
          break;
        }
      };
      console.debug("matches", matches);
    }
    
    // if(lines[i].replace(/\n/, "").trim().length == 0){
    //   console.debug(lines[i]);
    //   blank_line = true
    //   n++;
    // } else {
    //   if(blank_line){
    //     found = lines[i].match(/- ([^\n]+)/);
    //     if(found){
    //       if(!item_list[n]){
    //         item_list[n] = [];
    //       }
    //       
    //       item_list[n].push(found)
    //     }
    //   }
    // }
  };
  return;
  console.debug(item_list);
  return;
  var items = data.match(/- ([^\n]+)/g);
  if (items && items.length === 0) {
    return null;
  }

  items = _.map(items, function(item) {
    return item.replace(/^- /, "");
  });

  return template({
    list: items
  });
};

$(function() {
  var from = $("#from");
  var data = from.html();
  var lines = data.match(/\n?.*\n/g);
  
  setTimeout(function() {
    App.methods.list(lines);
  }, 1000);
});