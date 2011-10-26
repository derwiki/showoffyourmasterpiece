class DefaultController < ApplicationController
  def show ; end

  def upload
    @photo = params[:photo]
    render :text => "Photo size is #{@photo.size}"
  end

end
