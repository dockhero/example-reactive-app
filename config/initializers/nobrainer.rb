NoBrainer.configure do |config|
  config.rethinkdb_urls = ["rethinkdb://admin:#{ENV.fetch('RETHINKDB_PASSWORD')}@#{ENV.fetch('DOCKHERO_HOST')}:28015/logsfeed"]
  config.warn_on_active_record = false
end
