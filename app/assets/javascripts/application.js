// This is a manifest file that'll be compiled into including all the files listed below.
// Add new JavaScript/Coffee code in separate files in this directory and they'll automatically
// be included in the compiled file accessible from http://example.com/assets/application.js
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
//= require jquery
//= require jquery_ujs
//= require jquery.remotipart
//= require_tree .

$('form').live('ajax:remotipartSubmit', function() {});
var App = {};
App.init = function() {
  var upload_form = $('form#upload');
  upload_form.change(function() {
    $('#use_this_photo').attr('disabled', 'disabled');
    upload_form.submit();
  });
  $('#use_this_photo').click(App.useThisPhoto);
  $('#use_this_photo').attr('disabled', 'disabled');
}

App.photoUploadedCallback = function(data) {
  $('.examplepicture').css('background-image', 'url(' + data.large_thumbnail_url + ')');
  $('.preview img').attr('src', data.large_thumbnail_url);
  $('#photo_id').val(data.photo_id);
  $('#use_this_photo').removeAttr('disabled');
}

App.useThisPhoto = function() {
  $('.content .frame').hide();
  $('.content .orderinfo').show();
}

App.paymentCallback = function(data) {
  $('.content .orderinfo').hide();
  $('.content .payment').show();
}

$(function() {
  App.init();
});
