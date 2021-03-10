/**
 * newsletter.js
 */
"use strict";

console.debug('newsletter.js');

jQuery(function($)
{
    //console.debug('ajaxurl: ' + ajaxurl);
    console.debug('mpSegEx: ', mpSegEx);
    var segmentType = mpSegEx.segmentType ;
    var newsletter_id = mpSegEx.newsletter_id ;
    var nl_lists_ids = mpSegEx.nl_lists_ids ;
/*
    // Search for
    // <button type="button" class="mailpoet-button" data-automation-id="email-submit"><span>Send</span></button>
    var $sendBtn = $('button[data-automation-id="email-submit"]');
    if(  $sendBtn.length == 0 )
        return ;
    console.debug('newsletter.js', 'sendBtn', $sendBtn.length);
*/

/*
    console.debug( window.location.hash );
    $(window).on('hashchange', function(ev) {
    console.debug('hashchange', ev);
    });
*/

/*
"Select2" component : https://select2.org/programmatic-control/add-select-clear-items
*/

    var $mpnl = $('#mailpoet_newsletter');

    /**
     * Observe the DOM to wait MailPoet React initialization,
     * then call hackNl().
     */
    new MutationObserver(function( mutations )
        {
            var self = this ;
            mutations.forEach(function( mutation )
            {
                //var newNodes = mutation.addedNodes; // DOM NodeList
                //if( newNodes == null )
                //    return ;
                jQuery( mutation.addedNodes ).each(function()
                {
                    if( jQuery( this ).hasClass( "form-field-row-segments" ) )
                    {
                        self.disconnect();
                        hackNl();
                    }
                });
            });    

        }).observe( $mpnl[0], {
            // https://developer.mozilla.org/fr/docs/Web/API/MutationObserver
            childList: true, subtree: true,
        });

    /**
     */
    function hackNl()
    {
        console.debug('hackNl');

        /*
        Remove unwanted segments.
        "nl_lists_ids" built by Artefacts\Mailpoet\Segment\Admin\Admin::wp_admin_enqueue_scripts_newsletter()
        */
        var $mp_segments = $('#mailpoet_segments');
        $mp_segments.find('option').each(function(idx,el)
        {
            var $el = $(el);
            if( nl_lists_ids.indexOf( $el.val() ) < 0 )
                $el.remove();
        });
        $mp_segments.trigger('change');

        // Button to create a Segmentation
        var $btNewSeg = $('<button type="button" class="mailpoet-button" disabled>Créer une segmentation</button>')
            .on('click', function()
            {
                // Launch Segmentation Dialog:
                new Segmentation( segmentType,  newsletter_id, {segmentNamePrefix: mpSegEx.segmentNamePrefix });
            })
            .appendTo( $('.form-field-row-segments', $mpnl ));

        // Disable or not the button upon newsletter segements selection
        $mp_segments
            .on('select2:select', function( ev )
            {
                var data = ev.params.data;
                console.debug(data);
                console.debug( 'select() option:selected:', $mp_segments.find('option:selected').length );
                if( $mp_segments.find('option:selected').length == 1 )
                    $btNewSeg.prop('disabled',false);
                else
                    $btNewSeg.prop('disabled',true);
            })
            .on('select2:unselect', function( ev )
            {
                console.debug( 'unselect() option:selected:', $mp_segments.find('option:selected').length );
                if( $mp_segments.find('option:selected').length == 1 )
                    $btNewSeg.prop('disabled',false);
                else
                    $btNewSeg.prop('disabled',true);
            })

    }
        
});
