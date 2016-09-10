module WelcomeHelper

  def livestatus_url(operation_id)
    "https://" + ENV.fetch('DOCKHERO_HOST') + "/operations/#{operation_id}"
  end
end
