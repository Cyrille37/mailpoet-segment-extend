/**
 * newsletter.js
 */
"use strict";

console.debug('newsletter.js is here ;-)');

jQuery(function($)
{
    //console.debug('ajaxurl: ' + ajaxurl);
    console.debug('mpSegEx: ', mpSegEx);

    // construit un index des segments contenus dans window.mailpoet_segments.
    var segments = {};
    window.mailpoet_segments.forEach( function(seg)
    {
        segments[seg.id] = seg ;
    });

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
    // Button to create a Segmentation
    var $btNewSeg = null ;

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
                        setTimeout( hackNl, 10);
                        //hackNl();
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
        //$mp_segments.val(null);// remove selection
        console.debug( 'selection:', $mp_segments.val() );
        var curSel = $mp_segments.val() ;
        $mp_segments.find('option').each(function(idx,el)
        {
            var $el = $(el);
            console.debug( 'el.data:', $el.data(), el.attributes );

            if( $el.val() == curSel )
                return ;
            if( segments[$el.val()].type != 'dynamic' )
                return ;
            $el.remove();
        });

        /*
        Ça plante plus tard si on met à jour le tableau window.mailpoet_segments
        console.debug('segments:', window.mailpoet_segments);
        window.mailpoet_segments = window.mailpoet_segments.filter(function(value, index, arr){ 
            if( nl_lists_ids.indexOf( value.id ) >= 0 )
                return true ;
        });
        console.debug('segments:',window.mailpoet_segments);
        */

        $mp_segments.trigger('change');

        $btNewSeg = $('<button type="button" class="mailpoet-button" disabled>Créer une segmentation</button>')
            .appendTo( $('.form-field-row-segments', $mpnl ))
            .on('click', function()
            {
                var selected = $mp_segments.find('option:selected') ;
                if( selected.length != 1 )
                {
                    alert('ERROR invalid ');
                    return ;
                }
                var $selected = $(selected[0]);
                console.debug( '$selected:', $selected, 'data:', $selected.data() );
                var nl_id = $selected.val() ;
                var nl_label = segments[nl_id].name ;
                // Launch Segmentation Dialog:
                new Segmentation( segmentationCallback, {
                    segmentNamePrefix: mpSegEx.segmentNamePrefix,
                    segmentType: mpSegEx.segmentType,
                    newsletter_id: nl_id, 
                    newsletter_label: nl_label,
                });
            })
            ;

        /**
         * Disable or not the button upon newsletter segments selection
         */
        $mp_segments
            .on('select2:select select2:unselect', function()
            {
                var $selected = $mp_segments.find('option:selected') ;
                console.debug( 'option:selected:', $selected.length, $selected );
                if( $selected.length != 1 )
                {
                    $btNewSeg.prop('disabled',true);
                    return ;
                }
                $selected = $($selected[0]);
    
                if( segments[ $selected.val() ].type == 'dynamic' )
                {
                    $btNewSeg.prop('disabled',true);
                }
                else
                {
                    $btNewSeg.prop('disabled',false);
                }
    
            });

    }

    /**
     * Callback called by Segmentation dialog.
     * Update the list selectbox with the freshly created segment.
     * 
     * segmentData : {
        created_at: "2021-03-31 17:15:31"
        deleted_at: null
        ​​description: "Segmentation créée le 2021-03-31 15:15:29"
        id: "30"
        name: "Mailing 2021-03-31 15:15:23"
        newsletter_id: "5"
        segmentType: "customField"
        segments: Array [ (1) […] ]
        type: "dynamic"
        updated_at: "2021-03-31 17:15:31"
        }
     */
    function segmentationCallback( segmentData )
    {
        var $mp_segments = $('#mailpoet_segments');

        console.debug('segmentData:',segmentData,'$mp_segments',$mp_segments);

        /*
        // Uncaught TypeError: item is undefined
        // Remove previous selection
        //$mp_segments.val(null).trigger('change');
        // Add new Segmentation as the only one selected item
        var newOption = new Option( segmentData.name, segmentData.id, true, true);
        //newOption = $('<option value="'+segmentData.id+'">'+segmentData.name+'</option>');
        $mp_segments.select2().append( newOption);.trigger('change');
        */

        if( segments[segmentData.id] === undefined )
        {
            segments[segmentData.id] = segmentData;
            window.mailpoet_segments.push(segmentData);
            $mp_segments.trigger('change');
        }

        $mp_segments.val(segmentData.id)
            .trigger('change');

        // Disable "New segmentation" button
        $btNewSeg.prop('disabled',true);
    }

});
