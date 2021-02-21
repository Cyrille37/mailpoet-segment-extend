/**
 * newsletter.js
 */
"use strict";

console.debug('newsletter.js');

jQuery(function($)
{
    var segmentation ;

    //console.debug('ajaxurl: ' + ajaxurl);
    console.debug('mpSegEx: ', mpSegEx);
    var segmentType = mpSegEx.segmentType ;
    var newsletter_id = mpSegEx.newsletter_id ;

/*
    // Search for
    // <button type="button" class="mailpoet-button" data-automation-id="email-submit"><span>Send</span></button>
    var $sendBtn = $('button[data-automation-id="email-submit"]');
    if(  $sendBtn.length == 0 )
        return ;
    console.debug('newsletter.js', 'sendBtn', $sendBtn.length);
*/

segmentation = new Segmentation( segmentType,  newsletter_id);


});
