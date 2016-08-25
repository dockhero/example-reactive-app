module WelcomeHelper

  def livestatus_url(operation_id)
    ENV.fetch('DOCKHERO_FLEXIBLE_SSL_URL') + "/operations/#{operation_id}"
  end
end
