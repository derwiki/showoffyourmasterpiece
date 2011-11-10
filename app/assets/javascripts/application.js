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
App.busyState = false;
App.busy = function(val) {
  if (val) {
    App.busyState = val;
  } else {
    val = !App.busyState;
    App.busyState = val;
  }
  $('.roundbox').css('z-index', val ? 30 : -20);
}

App.init = function() {
  var upload_form = $('form#upload');
  upload_form.change(function() {
    $('.notification').hide();
    $('#use_this_photo').attr('disabled', 'disabled');
    upload_form.submit();
  });
  $('#use_this_photo').click(function(evt) {
    evt.preventDefault();
    App.showTab('order');
    $('.roundbox').css('height', '535px');
  });
  $('#use_this_photo').attr('disabled', 'disabled');
  // load specific step with URL hash
  if (document.location.hash) {
    App.showTab(document.location.hash.replace('#', ''));
  }
}

App.photoUploadedCallback = function(data) {
  console.log('photoUploadedCallback');
  console.log(data);
  $('.notification').hide();

  if (data.height > data.width) {
    var width = 375;
    var height = 375 * data.height / data.width;
  } else {
    var width = 500;
    var height = 500 * data.height / data.width;
  }
  App.height = height;
  App.width = width;
  $('.preview').
    css('background-size', '100%').
    css('background-image', 'url(' + data.large_thumbnail_url + ')');
  $('.uploader .preview').
    css('width', width + 'px').
    css('height', height + 'px');
  $('.roundbox').css('height', (height+170) + 'px');

  $('.order .preview').
    css('width', .75 * width + 'px').
    css('height', .75 * height + 'px');

  $('#photo_id').val(data.photo_id);
  App.photo_id = data.photo_id;
  $('#use_this_photo').removeAttr('disabled');
  console.log('Aspect ratio: ', data.aspect_ratio);
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

   console.log("Created token");
    // prevent the form from submitting with the default action
    return false;
  });
};

App.stripeResponseHandler = function(status, response) {
  console.log('stripe response', response);
  if (response.error) {
    //show the errors on the form
   console.log("response.error", response.error);
    $(".payment-errors").html(response.error.message);
  } else {
    console.log("response.success", response);
    var form$ = $("#payment-form");
    // token contains id, last4, and card type
    var token = response['id'];
    // insert the token into the form so it gets submitted to the server
    form$.append("<input type='hidden' name='stripeToken' value='" + token + "'/>");
    form$.append("<input type='hidden' name='photo_id' value='" + App.photo_id + "'/>");
    // and submit
    form$.get(0).submit();
  }
}

$(function() {
  App.init();
  App.stripeInit();
});
