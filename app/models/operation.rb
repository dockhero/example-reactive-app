class Operation
  include NoBrainer::Document
  field :progress, type: Integer, required: true, default: 0
end
