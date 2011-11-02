var Markdown = function() {
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
    var regexp = /```\s*(([^\n]+))?\n([^```]+)```/gm;
    var template = _.template("[<%= type %>]\n<%= content%>\n[/<%= type %>]");

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
    content = content.replace(/[ ]{4}([^\n]+)/gm, function(content, code) {
      return template({
        type: "CODE",
        content: code
      });
    });

    /* `My code block` => [CODE]My code block[/CODE] */
    return content.replace(/`([^`\n]+.?)`/g, function(content, code) {
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
    It ignores markdown that are inside a code block.
  */
  self.strong = function(content) {
    return content.replace(/[\*]{2}([^\*{2}]+)[\*]{2}/mg, '[B]$1[/B]');
  };

  /*
    @document String A markdown document to process
    @return String A BBCode document.
  */
  self.process = function(document) {
    var i, split, length, con = true,
    to, re, methods = ["url", "italic", "underscore", "strong"];

    /* Line breaks should be equal on all plattforms */
    document = document.replace(/\r\n/, "\n");

    /* Converting all code related markdown blocks to bbcode code blocks */
    document = self.code(document);

    split = document.split(/\n/);
    for (i = 0, length = split.length; i < length; i++) {
      if ((document.match(/\[\/?[A-Z]+\]/g) || []).length > 1 && split[i].match(/\[[A-Z]+\]/)) {
        for (i = i + 1; con; i++) {
          if (!split[i] || split[i].match(/^\[\/[A-Z]+\]\n?$/)) {
            con = false;
          }
        };
      } else {
        _.each(methods, function(method) {
          split[i] = self[method](split[i]);
        });
        _.each(["unorderedList", "orderedList"], function(method) {
          /*
            re = {
              to: 5,
              data: "template-data",
              found: true
            }
          */
          re = self[method](split, i);
          if (re.found) {
            for (i = i, to = re.to; i < to; i++) {
              split[i] = null;
            };

            split[i] = re.data;
            _.each(methods, function(method) {
              split[i] = self[method](split[i]);
            });
          }
        });
      }
    };

    return _.reject(split, function(line) {
      return line === null;
    }).join("\n");
  };

  /*
    Converts Markdown *Text* into into BBCode's [I] tag.
    @content String The raw document. Each line is in Markdown.
    @return String The raw document. Each line is in BBCode.
  */
  self.italic = function(content) {
    return content.replace(/(?!.*\*{2})\*([^\*\n]+)\*(?!\*)/gm, "[I]$1[/I]")
  };

  /*
    Converts Markdown _Text_ and __Text__ into into BBCode's [U] tag.
    @content String The raw document. Each line is in Markdown.
    @return String The raw document. Each line is in BBCode.
  */
  self.underscore = function(content) {
    return _.reduce(["__([^__]+)__", "(?!.*\_{2})\_([^\_\n]+)\_(?!\_)"], function(content, regexp) {
      return content.replace(new RegExp(regexp, "gmi"), '[U]$1[/U]');
    },
    content);
  };

  /*
    Converts Markdown unordered lists into BBCode lists.
    @lines Array<String> A list of lines. Each line is in Markdown.
    @n Integer On what position should we start looking for a markdown list?
    @return Hash Take a look at the #renderList method for more information.
  */
  self.unorderedList = function(lines, n) {
    var template = _.template("[LIST]<% for (var i = 0, length = list.length; i < length; i++){ %>\n[*]<%= list[i] %><% }; %>\n[/LIST]");
    return self.renderList({
      template: template,
      lines: lines,
      n: n,
      match: /^- ([^\n]+)/,
      remove: /^\s*- /
    });
  };

  /*
    Converts Markdown ordered lists into BBCode lists.
    @lines Array<String> A list of lines. Each line is in Markdown.
    @n Integer On what position should we start looking for a markdown list?
    @return Hash Take a look at the #renderList method for more information.
  */
  self.orderedList = function(lines, n) {
    var template = _.template("[LIST=1]<% for (var i = 0, length = list.length; i < length; i++){ %>\n[*]<%= list[i] %><% }; %>\n[/LIST]");
    return self.renderList({
      template: template,
      lines: lines,
      n: n,
      match: /^\d+\. ([^\n]+)/,
      remove: /^\d+\. /
    });
  };

  /*
  @options Hash A hash of options used for rendering a markdown list
  Example list:
    options {
      template: "a template",
      n: 1,
      lines: [a line],
      match: /regexp/,
      remove: /regexp/
    }
    
    @template A underscore.js template
    @n Where #renderList should start look for a list
    @lines A list of lines for the entire document
    @match How do we know what a list item looks like?
    @remove What should be striped out before we can call it a list item?
  @return Hash 
    return {
      found: true,
      data: data,
      to: i
    };
    @found Did we find a list?
    @data How does the new, BBCode list looks like?
    @to On what line does the list end?
  */
  self.renderList = function(options) {
    var template, i, matches, lines, length;

    template = options.template;
    lines = options.lines;

    for (i = options.n, length = lines.length; i < length; i++) {
      /* Is this a list item ?*/
      if (lines[i].match(options.match)) {
        matches = [lines[i].replace(options.remove, "")];
        for (i = (i + 1); i < length; i++) {
          if (lines[i].match(options.match)) {
            matches.push(lines[i].replace(options.remove, ""));
          } else {
            break;
          }
        };

        /* 
          This is the end of the list
          Let's render it!
        */
        data = template({
          list: matches
        });

        return {
          found: true,
          data: data,
          to: (i - 1)
        };

      } else {
        return {
          found: false
        };
      }
    };
  };
};