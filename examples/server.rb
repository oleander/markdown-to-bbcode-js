require "sinatra"

def static(file)
  File.read(file)
end

get "/" do
  static("index.html")
end

get %r{/(.+)} do
  file = params["captures"].first
  begin
    path = File.readlink(file)
    static("../#{path}")
  rescue Errno::EINVAL
    static(file)
  end
end