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

    @large_thumbnail_url = json_resp['upload']['links']['large_thumbnail']
    render :text => "photoUploadedCallback('#{@large_thumbnail_url}');"
    return
  end

end
