var App = {};
App.templates = {};
App.methods = {};

App.methods.list = function(lines) {
  var template = _.template($("#list-template").html());
  for (var i = 0; i < lines.length; i++) {
    /* Is this a list item ?*/
    if(lines[i].match(/^\s*- ([^\n]+)/)){
      var matches = [lines[i].replace(/^\s*- /, "")];
      lines[i] = null;
      for (i = (i + 1); i < lines.length; i++) {
        if(lines[i].match(/^\s*- ([^\n]+)/)){
          matches.push(lines[i].replace(/^\s*- /, ""));
          lines[i] = null;
        } else {
          break;
        }
      };
      
      /* 
        This is the end of the list
        Let's render it!
      */
      lines[i] = template({
        list: matches.reverse()
      });
    }
  };
  
  /* We've to remove all empty lines. */
  return _.reject(lines, function(line){ return ! line; });  
};

$(function() {
  var from = $("#from");
  var data = from.html();
  var lines = data.match(/\n?.*\n/g);
  
  console.debug(App.methods.list(lines));
});