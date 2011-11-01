require 'net/http'
require 'uri'

IMGUR_UPLOAD_URL = "http://api.imgur.com/2/upload.json"
IMGUR_KEY        = "208ee486ec20c806eeabce32b7eb6b84"

class DefaultController < ApplicationController
  def show ; end

  def upload
    encoded_photo = Base64.encode64(params[:photo].tempfile.read())

    # http://www.rubyinside.com/nethttp-cheat-sheet-2940.html
    uri = URI.parse(IMGUR_UPLOAD_URL)
    http = Net::HTTP.new(uri.host, uri.port)
    request = Net::HTTP::Post.new(uri.request_uri)
    request.set_form_data({
      :key => IMGUR_KEY,
      :image => encoded_photo,
      :type => :base64,
    })
    response = http.request(request)
    json_resp = JSON.parse(response.body)
    unless response.code == "200"
      # handle upload error case
      render :text => json_resp
      return
    end

    # sample JSON response
    # {"upload"=>
    #   {"image"=>{
    #      "name"=>nil, "title"=>nil, "caption"=>nil,"hash"=>"BZTu4",
    #      "deletehash"=>"ODb9WjTv5UmJceY", "datetime"=>"2011-10-31 00:25:25",
    #      "type"=>"image/jpeg", "animated"=>"false",
    #      "width"=>1024, "height"=>683, "size"=>214707, "views"=>0,
    #      "bandwidth"=>0},
    #    "links"=>{"original"=>"http://i.imgur.com/BZTu4.jpg",
    #              "imgur_page"=>"http://imgur.com/BZTu4",
    #              "delete_page"=>"http://imgur.com/delete/ODb9WjTv5UmJceY",
    #              "small_square"=>"http://i.imgur.com/BZTu4s.jpg",
    #              "large_thumbnail"=>"http://i.imgur.com/BZTu4l.jpg"}}}

    @original_url = json_resp['upload']['links']['original']
    photo = Photo.create! :url => @original_url
    @large_thumbnail_url = json_resp['upload']['links']['large_thumbnail']

    data = {
      :large_thumbnail_url => @large_thumbnail_url,
      :photo_id            => photo.id
    }
    render :text => "App.photoUploadedCallback(#{data.to_json});"
    return
  end

  def order
    photo = Photo.find_by_id params[:photo_id]
    photo.update_attributes! :username => params[:name],
      :address1 => params[:address1],
      :address2 => params[:address2],
      :state    => params[:state],
      :zipcode  => params[:zipcode],
      :email    => params[:email]
    render :text => "App.paymentCallback(#{{
      :photo_id => photo.id, :status => true}.to_json});"
  end

end
