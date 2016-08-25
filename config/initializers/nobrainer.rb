NoBrainer.configure do |config|
  config.rethinkdb_urls = ["rethinkdb://#{ENV.fetch('DOCKHERO_HOST')}:28015/logsfeed"]
end
