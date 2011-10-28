var App = {};
App.templates = {};
App.methods = {};

/*
  Converts Markdown ordered lists into BBCode lists.
  @lines Array<String> A list of lines. Each line is in Markdown.
  @return Array<String> A list of lines. Each line is in BBCode.
*/
App.methods.orderedList = function(lines) {
  var template = _.template("[LIST=1]<% for (var i = list.length - 1; i >= 0; i--){ %>\n[*]<%= list[i] %><% }; %>\n[/LIST]");
  for (var i = 0; i < lines.length; i++) {
    /* Is this a list item ?*/
    if (lines[i].match(/^\d+\. ([^\n]+)/)) {
      var matches = [lines[i].replace(/^\d+\. ([^\n]+)/, "$1")];
      lines[i] = null;
      for (i = (i + 1); i < lines.length; i++) {
        if (lines[i].match(/^\d+\. ([^\n]+)/)) {
          matches.push(lines[i].replace(/^\d+\. /, ""));
          lines[i] = null;
        } else {
          break;
        }
      };

      /* 
        This is the end of the list
        Let's render it!
      */
      lines[i - 1] = template({
        list: matches.reverse()
      });
    }
  };

  /* We've to remove all empty lines. */
  return _.reject(lines, function(line) {
    return line === null;
  });
};

/*
  Converts Markdown unordered lists into BBCode lists.
  @lines Array<String> A list of lines. Each line is in Markdown.
  @return Array<String> A list of lines. Each line is in BBCode.
*/
App.methods.unorderedList = function(random) {
  var template = _.template("[LIST]<% for (var i = list.length - 1; i >= 0; i--){ %>\n[*]<%= list[i].replace(/\n/, '') %><% }; %>\n[/LIST]");
  for (var i = 0; i < random.length; i++) {
    /* Is this a list item ?*/
    if (random[i].match(/^- ([^\n]+)/)) {
      var matches = [random[i].replace(/^- /, "")];
      random[i] = null;
      for (i = (i + 1); i < random.length; i++) {
        if (random[i].match(/^- ([^\n]+)/)) {
          matches.push(random[i].replace(/^\s*- /, ""));
          random[i] = null;
        } else {
          break;
        }
      };

      /* 
        This is the end of the list
        Let's render it!
      */
      random[i - 1] = template({
        list: matches.reverse()
      });
    }
  };

  /* We've to remove all empty lines. */
  return _.reject(random, function(line) {
    return line === null;
  });
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
  Converts Markdown code tag into BBCode's code tag.
  @content String The raw document. Each line is in Markdown.
  @return String The raw document. Each line is in BBCode.
  A Markdown code block looks like this;
  ``` html
  Some HTML code
  ```
  
  ```
  Some HTML code
  ```
  
  `Code!`
*/
App.methods.code = function(content) {
  var regexp = /```\s*(([^\n]+))?([^```]+)```/img;
  var template = _.template("[<%= type %>]<%= content%>[/<%= type %>]");

  var getType = function(match) {
    var type = match.trim().toUpperCase();
    if (_.include(["CODE", "HTML", "PHP"], type)) {
      return type;
    } else {
      return "CODE";
    }
  };
  
  /*
    ``` code
    My code block
    ```
    =>
    [CODE]My Code block[/CODE]
  */
  content = content.replace(regexp, function(full, none, type, code) {
    var type = getType(type);
    if (code.trim().length === 0) {
      code = type;
    } else {
      code = code.trim();
    }

    return template({
      type: type,
      content: code
    });
  });
  
  /* [    ]My code block => [CODE]My code block[/CODE] */
  content = content.replace(/\n[ ]{4,}([^\n]+)\n/g, function(content, code) {
    return template({
      type: "CODE",
      content: code
    });
  });
  
  /* `My code block` => [CODE]My code block[/CODE] */
  return content.replace(/`([^`]+)`/g, function(content, code) {
    return template({
      type: "CODE",
      content: code
    });
  });
};

/*
  Converts Markdown **Text** into into BBCode's [B] tag.
  @content String The raw document. Each line is in Markdown.
  @return String The raw document. Each line is in BBCode.
*/
App.methods.strong = function(content) {
  return content.replace(/[\*]{2}([^\*{2}]+)[\*]{2}/gmi, '[B]$1[/B]');
};

/*
  Converts Markdown *Text* into into BBCode's [I] tag.
  @content String The raw document. Each line is in Markdown.
  @return String The raw document. Each line is in BBCode.
*/
App.methods.italic = function(content) {
  return content.replace(/\*([^\*]+)\*/gmi, '[I]$1[/I]');
};

/*
  Converts Markdown _Text_ and __Text__ into into BBCode's [U] tag.
  @content String The raw document. Each line is in Markdown.
  @return String The raw document. Each line is in BBCode.
*/
App.methods.underscore = function(content) {
  _.each(["__([^__]+)__", "[^_]_([^\_]+)_[^_]"], function(regexp) {
    content = content.replace(new RegExp(regexp, "gmi"), '\n[U]$1[/U]');
  });

  return content;
};

$(function() {
  var from = $("#from");
  var container = $("#container");
  var to = $("#to");
  from.val(container.html());

  from.bind("change", function() {
    var content = from.val();
    
    content = content.replace(/\r/g,"\n");
    content = "\n\n" + content + "\n\n";
    /* String specific methods */
    _.each(["url", "strong", "italic", "underscore", "code"], function(method) {
      content = App.methods[method](content);
    });

    /* Line specific methods */
    var lines = content.split(/\n/);
    _.each(["unorderedList", "orderedList"], function(method) {
      lines = App.methods[method](lines);
    });

    to.html(lines.join("\n").replace(/^\n\n/, "").replace(/\n\n$/, ""));
  });

  from.trigger("change");

  $(document).keyup(function() {
    from.trigger("change");
  });
});