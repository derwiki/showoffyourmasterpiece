require 'net/http'
require 'uri'
require 'open-uri'
require 'image_size'

IMGUR_UPLOAD_URL = "http://api.imgur.com/2/upload.json"
IMGUR_KEY        = "208ee486ec20c806eeabce32b7eb6b84"

STRIPE_TEST_KEY = "lbVrAGi1psT4ZREpm88WhPb2cHG9ryBB"
STRIPE_LIVE_KEY = "fLIjz0AEjqHcFqasegIYOnDVpzuNor5D"
FRAME_ASPECT_RATIO = 1.5
ACCEPTABLE_RATIO = [-0.2, 0.1].map {|x| FRAME_ASPECT_RATIO + x}
PRICE = 10000

class DefaultController < ApplicationController
  def show

  end

  def upload
    dimensions = File.open(params[:photo].tempfile.path, 'rb') do |fh|
      ImageSize.new(fh).get_size
    end
    aspect_ratio = dimensions.max.to_f / dimensions.min.to_f
    puts "Aspect ratio: #{aspect_ratio}"
    unless aspect_ratio.between? *ACCEPTABLE_RATIO
      render :text => "App.photoUploadError('E_BADRATIO');"
      return
    end

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
      :photo_id            => photo.id,
      :aspect_ratio        => aspect_ratio
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

  def payment
    token = params[:stripeToken]
    photo = Photo.find_by_id(params[:photo_id])

    # see your keys here https://manage.stripe.com/account
    if Rails.env.production?
      Stripe.api_key = STRIPE_LIVE_KEY
    else
      Stripe.api_key = STRIPE_TEST_KEY
    end

    # create a Customer
    customer = Stripe::Customer.create(
      :card => token,
      :description => photo.email
    )

    photo.stripe_customer_id = customer.id
    photo.save!
    puts "photo.inspect: #{photo.inspect}"

    customer_id = customer.id
    puts "customer_id: #{customer_id}"

    puts Stripe::Charge.create(
        :amount => PRICE,
        :currency => "usd",
        :customer => customer_id
    )
    flash[:notice] = "Your payment was successful. Thank you!"
    redirect_to "/"
  end

end
