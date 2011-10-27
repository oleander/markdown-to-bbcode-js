var App       = {};
App.templates = {};
App.methods   = {};

App.methods.list = function(data) {
  var items = data.match(/- ([^\n]+)/g);
  items = _.map(items, function(item) {
    return item.replace(/^- /, "");
  });
  return App.templates.list({
    list: items
  });
};

$(function() {
  App.templates.list = _.template($("#list-template").html());

  var from = $("#from");
  var data = from.html();

  console.debug(App.methods.list(data));
});