var App = {};
App.templates = {};
App.methods = {};

var Converter = function() {
  if (! (this instanceof arguments.callee)) {
    return new arguments.callee(arguments);
  }

  var self = this;

  /*
    Converts Markdown URLs into BBCode URL.
    @content String The raw document. Each line is in Markdown.
    @return String The raw document. Each line is in BBCode.
  */
  self.url = function(content) {
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
  self.code = function(content) {
    var regexp = /```\s*(([^\n]+))?\n([^```]+)```/img;
    var template = _.template("[<%= type %>]<%= content%>[/<%= type %>]");

    var getType = function(match) {
      match = match || "";
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
    content = content.replace(/[ ]{4,}([^\n]+)/g, function(content, code) {
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
  self.strong = function(content) {
    return content.replace(/[\*]{2}([^\*{2}]+)[\*]{2}/gmi, '[B]$1[/B]');
  };

  /*
    Converts Markdown *Text* into into BBCode's [I] tag.
    @content String The raw document. Each line is in Markdown.
    @return String The raw document. Each line is in BBCode.
  */
  self.italic = function(content) {
    return content.replace(/(?!.*\*{2})\*([^\*\n]+)\*(?!\*)/, "[I]$1[/I]")
  };

  /*
    Converts Markdown _Text_ and __Text__ into into BBCode's [U] tag.
    @content String The raw document. Each line is in Markdown.
    @return String The raw document. Each line is in BBCode.
  */
  self.underscore = function(content) {
    return _.reduce(["__([^__]+)__", "(?!.*\_{2})\_([^\_\n]+)\_(?!\_)"], function(content, regexp) {
      return content.replace(new RegExp(regexp, "gmi"), '[U]$1[/U]');
    },content);
  };

  /*
    Converts Markdown unordered lists into BBCode lists.
    @lines Array<String> A list of lines. Each line is in Markdown.
    @return Array<String> A list of lines. Each line is in BBCode.
  */
  self.unorderedList = function(lines) {
    var template, i, matches;
    template = _.template("[LIST]<% for (var i = list.length - 1; i >= 0; i--){ %>\n[*]<%= list[i] %><% }; %>\n[/LIST]");
    for (i = 0; i < lines.length; i++) {
      /* Is this a list item ?*/
      if (lines[i].match(/^- ([^\n]+)/)) {
        matches = [lines[i].replace(/^- /, "")];
        lines[i] = null;
        for (i = (i + 1); i < lines.length; i++) {
          if (lines[i].match(/^- ([^\n]+)/)) {
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
    Converts Markdown ordered lists into BBCode lists.
    @lines Array<String> A list of lines. Each line is in Markdown.
    @return Array<String> A list of lines. Each line is in BBCode.
  */
  self.orderedList = function(lines) {
    var template, matches, i;
    template = _.template("[LIST=1]<% for (var i = list.length - 1; i >= 0; i--){ %>\n[*]<%= list[i] %><% }; %>\n[/LIST]");
    for (i = 0; i < lines.length; i++) {
      /* Is this a list item ?*/
      if (lines[i].match(/^\d+\. ([^\n]+)/)) {
        matches = [lines[i].replace(/^\d+\. ([^\n]+)/, "$1")];
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
    @data String The document to be converted later on
    @return A Converter object
  */
  self.raw = function(data) {
    self.data = data; return self;
  };
  
  /*
    @return A BBCode version of the @data var
  */
  self.toBBCode = function() {
    content = self.data.replace(/\r/g, "\n");
    content = "\n\n" + content + "\n\n";
    
    /* String specific methods */
    _.each(["url", "strong", "italic", "underscore", "code"], function(method) {
      content = self[method](content);
    });

    /* Line specific methods */
    var lines = content.split(/\n/);
    _.each(["unorderedList", "orderedList"], function(method) {
      lines = self[method](lines);
    });

    return lines.join("\n").replace(/^\n\n/, "").replace(/\n\n$/, "");
  };
};

$(function() {
  var from = $("#from");
  var container = $("#container");
  var to = $("#to");
  from.val(container.html());
  var converter = new Converter();
  from.bind("change", function() {
    to.html(converter.raw(from.val()).toBBCode());
  });

  from.trigger("change");

  $(document).keyup(function() {
    from.trigger("change");
  });
});