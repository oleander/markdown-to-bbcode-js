var App = {};
App.templates = {};
App.methods = {};

/*
  Converts Markdown lists into BBCode lists
  @lines Array<String> A list of lines. Each line is in Markdown.
  @return Array<String> A list of lines. Each line is in BBCode.
*/
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

/*
  Converts Markdown URLs into BBCode URL.
  @content String The raw document. Each line is in Markdown.
  @return String The raw document. Each line is in BBCode.
*/
App.methods.url = function(content) {
  return content.replace(/\[([^\]]+)]\(([^)]+)\)/gmi, '[URL="$2"]$1[/URL]');
};

/*
  Converts Markdown **Text** into into BBCode's [B] tag.
  @content String The raw document. Each line is in Markdown.
  @return String The raw document. Each line is in BBCode.
*/
App.methods.strong = function(content) {
  return content.replace(/\*\*([^\*\*]+)\*\*/, '[B]$1[/B]');
};

/*
  Converts Markdown *Text* into into BBCode's [I] tag.
  @content String The raw document. Each line is in Markdown.
  @return String The raw document. Each line is in BBCode.
*/
App.methods.italic = function(content) {
  return content.replace(/\*([^\*]+)\*/, '[I]$1[/I]');
};

$(function() {
  var from = $("#from");
  var content = from.html();
  
  /* String specific methods */
  _.each(["url", "strong", "italic"], function(method) {
    content = App.methods[method](content);
  });
  
  /* Line specific methods */
  var lines = content.match(/\n?.*\n/g);
  lines = App.methods.list(lines);
  
  from.html(lines.join("\n"));
});