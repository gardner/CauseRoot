require 'csv'

class GraphsController < ApplicationController
  # GET /graphs
  # GET /graphs.json

#  caches_action :index, :expires_in => 600
  
  def index
    if params[:allUserFlag]
  	    csvstr = Graph.grabdata({:id=>0})
    else
        csvstr = Graph.grabdata(@current_user)
    end
    
    respond_to do |format|
      #format.html # index.html.erb
      format.json { render json: @graphs }
      format.csv { send_data csvstr }
    end
  end
end

        
