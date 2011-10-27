$ ->
  from = $("#from");
  to   = $("#to");
  data = from.html();

  list = (ingoing) ->
    items = ingoing.match(/- (\w+)/g)
    list = ""
    
    if items
    #   for (var i=0; i < items.length; i++) {
    #     list = list + "[*]" + items[i] + "\n";
    #   };