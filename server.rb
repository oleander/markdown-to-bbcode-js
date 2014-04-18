require "sinatra"

def static(file)
  File.read(file)
end

get "/?" do
  send_file "index.html"
end

get %r{/(.+)} do
  file = params["captures"].first
  
  begin
    path = File.readlink(file)
    send_file("../#{path}")
  rescue
    send_file file
  end
end