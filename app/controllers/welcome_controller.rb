class WelcomeController < ApplicationController
  expose :operation, :load_operation

  def index
  end

  def do_something
    operation.progress += 1
    operation.save!

    render json: {status: 'OK'}
  end

  private

  def load_operation
    if session[:operation_id]
      Operation.find(session[:operation_id])
    else
      Operation.create.tap do |op|
        session[:operation_id] = op.id
      end
    end
  end
end
