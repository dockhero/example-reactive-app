Rails.application.routes.draw do
  root to: 'welcome#index'

  post '/do_something', to: 'welcome#do_something'
end
