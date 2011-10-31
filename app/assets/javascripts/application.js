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
$(function() {
  var upload_form = $('form#upload');
  upload_form.change(function() {
    upload_form.submit();
  });
});
function photoUploadedCallback(url) {
  $('.examplepicture').css('background-image', 'url(' + url + ')');
  $('.content .frame').hide();
  $('.content .orderinfo').show();
  $('.preview img').attr('src', url);
}
