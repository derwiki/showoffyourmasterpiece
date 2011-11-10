// This [jQuery](http://jquery.com/) plugin implements an `<iframe>`
// [transport](http://api.jquery.com/extending-ajax/#Transports) so that
// `$.ajax()` calls support the uploading of files using standard HTML file
// input fields. This is done by switching the exchange from `XMLHttpRequest` to
// a hidden `iframe` element containing a form that is submitted.
// The [source for the plugin](http://github.com/cmlenz/jquery-iframe-transport)
// is available on [Github](http://github.com/) and dual licensed under the MIT
// or GPL Version 2 licenses.
// ## Usage
// To use this plugin, you simply add a `iframe` option with the value `true`
// to the Ajax settings an `$.ajax()` call, and specify the file fields to
// include in the submssion using the `files` option, which can be a selector,
// jQuery object, or a list of DOM elements containing one or more
// `<input type="file">` elements:
//     $("#myform").submit(function() {
//         $.ajax(this.action, {
//             files: $(":file", this),
//             iframe: true
//         }).complete(function(data) {
//             console.log(data);
//         });
//     });
// The plugin will construct a hidden `<iframe>` element containing a copy of
// the form the file field belongs to, will disable any form fields not
// explicitly included, submit that form, and process the response.
// If you want to include other form fields in the form submission, include them
// in the `data` option, and set the `processData` option to `false`:
//     $("#myform").submit(function() {
//         $.ajax(this.action, {
//             data: $(":text", this).serializeArray(),
//             files: $(":file", this),
//             iframe: true,
//             processData: false
//         }).complete(function(data) {
//             console.log(data);
//         });
//     });
// ### The Server Side
// If the response is not HTML or XML, you (unfortunately) need to apply some
// trickery on the server side. To send back a JSON payload, send back an HTML
// `<textarea>` element with a `data-type` attribute that contains the MIME
// type, and put the actual payload in the textarea:
//     <textarea data-type="application/json">
//       {"ok": true, "message": "Thanks so much"}
//     </textarea>
// The iframe transport plugin will detect this and attempt to apply the same
// conversions that jQuery applies to regular responses. That means for the
// example above you should get a Javascript object as the `data` parameter of
// the `complete` callback, with the properties `ok: true` and
// `message: "Thanks so much"`.
// ### Compatibility
// This plugin has primarily been tested on Safari 5, Firefox 4, and Internet
// Explorer all the way back to version 6. While I haven't found any issues with
// it so far, I'm fairly sure it still doesn't work around all the quirks in all
// different browsers. But the code is still pretty simple overall, so you
// should be able to fix it and contribute a patch :)
// ## Annotated Source
(function(a,b){a.ajaxPrefilter(function(a,b,c){if(a.iframe)return"iframe"}),a.ajaxTransport("iframe",function(b,c,d){function m(){a(j).each(function(){this.remove()}),a(k).each(function(){this.disabled=!1}),e.attr("action",g||"").attr("target",h||"").attr("enctype",i||""),f.attr("src","javascript:false;").remove()}var e=null,f=null,g=null,h=null,i=null,j=[],k=[],l=a(b.files).filter(":file:enabled");b.dataTypes.shift();if(l.length)return l.each(function(){e!==null&&this.form!==e&&jQuery.error("All file fields must belong to the same form"),e=this.form}),e=a(e),g=e.attr("action"),h=e.attr("target"),i=e.attr("enctype"),e.find(":input:not(:submit)").each(function(){!this.disabled&&(this.type!="file"||l.index(this)<0)&&(this.disabled=!0,k.push(this))}),typeof b.data=="string"&&b.data.length>0&&jQuery.error("data must not be serialized"),a.each(b.data||{},function(b,c){a.isPlainObject(c)&&(b=c.name,c=c.value),j.push(a("<input type='hidden'>").attr("name",b).attr("value",c).appendTo(e))}),j.push(a("<input type='hidden' name='X-Requested-With'>").attr("value","IFrame").appendTo(e)),accepts=b.dataTypes[0]&&b.accepts[b.dataTypes[0]]?b.accepts[b.dataTypes[0]]+(b.dataTypes[0]!=="*"?", */*; q=0.01":""):b.accepts["*"],j.push(a("<input type='hidden' name='X-Http-Accept'>").attr("value",accepts).appendTo(e)),{send:function(c,d){f=a("<iframe src='javascript:false;' name='iframe-"+a.now()+"' style='display:none'></iframe>"),f.bind("load",function(){f.unbind("load").bind("load",function(){var a=this.contentWindow?this.contentWindow.document:this.contentDocument?this.contentDocument:this.document,b=a.documentElement?a.documentElement:a.body,c=b.getElementsByTagName("textarea")[0],e=c?c.getAttribute("data-type"):null,f=200,g="OK",h={text:e?c.value:b?b.innerHTML:null},i="Content-Type: "+(e||"text/html");d(f,g,h,i),setTimeout(m,50)}),e.attr("action",b.url).attr("target",f.attr("name")).attr("enctype","multipart/form-data").get(0).submit()}),f.insertAfter(e)},abort:function(){f!==null&&(f.unbind("load").attr("src","javascript:false;"),m())}}})})(jQuery),function(a){var b;a.remotipart=b={setup:function(c){c.one("ajax:beforeSend.remotipart",function(d,e,f){return delete f.beforeSend,f.iframe=!0,f.files=a(a.rails.fileInputSelector,c),f.data=c.serializeArray(),f.processData=!1,f.dataType===undefined&&(f.dataType="script *"),f.data.push({name:"remotipart_submitted",value:!0}),a.rails.fire(c,"ajax:remotipartSubmit",[e,f])&&a.rails.ajax(f),b.teardown(c),!1}).data("remotipartSubmitted",!0)},teardown:function(a){a.unbind("ajax:beforeSend.remotipart").removeData("remotipartSubmitted")}},a("form").live("ajax:aborted:file",function(){var c=a(this);return b.setup(c),!a.support.submitBubbles&&a.rails.callFormSubmitBindings(c)===!1?a.rails.stopEverything(e):(a.rails.handleRemote(c),!1)})}(jQuery)