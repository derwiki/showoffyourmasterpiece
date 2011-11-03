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
  $('#use_this_photo').click(function() {
    App.showTab('order');
  });
  $('#use_this_photo').attr('disabled', 'disabled');
  // load specific step with URL hash
  if (document.location.hash) {
    App.showTab(document.location.hash.replace('#', ''));
  }
}

App.photoUploadedCallback = function(data) {
  $('.notification').hide();
  $('.uploader .preview').css('background-image', 'url(' + data.large_thumbnail_url + ')');
  $('.order    .preview img').attr('src', data.large_thumbnail_url);
  $('#photo_id').val(data.photo_id);
  $('#use_this_photo').removeAttr('disabled');
}

App.photoUploadError = function(error_type) {
  $('#use_this_photo').attr('disabled', 'disabled');
  $('.notification').text(
    "The photo you uploaded has dimensions that are very different from the" +
    " frame size. Try another photo with an aspect ratio closer to 4:3");
  $('.notification').show();
}

App.showTab = function(tab) {
  $('.content > div').hide();
  $('.content .' + tab).show();
}

App.paymentCallback = function(data) {
  App.showTab('payment');
}

App.stripeInit = function() {
  $("#payment-form").submit(function(event) {
    // disable the submit button to prevent repeated clicks
    $('.submit-button').attr("disabled", "disabled");

    var amount = 10000; //amount you want to charge in cents
    Stripe.createToken({
        number: $('.card-number').val(),
        cvc: $('.card-cvc').val(),
        exp_month: $('.card-expiry-month').val(),
        exp_year: $('.card-expiry-year').val()
    }, amount, App.stripeResponseHandler);

    // prevent the form from submitting with the default action
    return false;
  });
};

App.stripeResponseHandler = function(status, response) {
  console.log('stripe response', response);
  if (response.error) {
    //show the errors on the form
    $(".payment-errors").html(response.error.message);
  } else {
    var form$ = $("#payment-form");
    // token contains id, last4, and card type
    var token = response['id'];
    // insert the token into the form so it gets submitted to the server
    form$.append("<input type='hidden' name='stripeToken' value='" + token + "'/>");
    // and submit
    form$.get(0).submit();
  }
}

$(function() {
  App.init();
  App.stripeInit();
});
