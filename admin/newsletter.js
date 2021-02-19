/**
 * newsletter.js
 */
"use strict";

console.debug('newsletter.js');

var Segmentation = function( $container )
{
    var $ = jQuery ;
    var self = this ;

    /**
     * Un ensemble de segments
     * dans lequel sera appliqué un "ET".
     */
    var segments = [];
    var $segments ;
    var $tools ;

    this.cfData ;

    this.addSegment = function()
    {
        if( ! $segments )
            throw new Error('Segmentation missing first drawing!');
        var seg = new Segmentation.Segment();
        segments.push( seg );
        seg.draw( $segments );
    }

    this.draw = function()
    {
        $container.children().remove();

        $segments = $('<div class="segments"></div>')
            .appendTo( $container );

        if( segments.length == 0 )
        {
            this.addSegment();
        }
        else for( var i in segments )
        {
            segments[i].draw( $segments );
        }

        $tools = $('<div class="tools"></div>')
            .appendTo( $container );

        $tools.append( Segmentation.Button({
            text: 'Ajouter un ensemble de choix',
            click: function () {
                self.addSegment();
            }
        }));

    }
};

/**
 * Un ensemble de custom field de MailPoet
 * dans lequel sera appliqué un "OU".
 */
Segmentation.Segment = function()
{
    var $ = jQuery ;
    var self = this ;
    var $container ;
    var $customfields ;

    var fields = [] ;

    this.addCustomField = function()
    {
        if( ! $customfields )
            throw new Error('Segment missing first drawing!');

        var cf = new Segmentation.CustomField();
        fields.push( cf );
        cf.draw( $customfields );
    }

    this.draw = function( $parent )
    {
        $container = $('<div class="segment"><div class="operator operator-and">ET</div></div>' )
            .appendTo( $parent );
        if( $container.index() == 0 )
            $('.operator', $container).hide();

        var $el = $('<div><label>Ensemble de choix n°<span>'+ (1+$container.index()) +'</label></div>' )
            .appendTo( $container );
        $el.append( Segmentation.Button({
            //text: 'Remove segment',
            html: '<span class="dashicons dashicons-trash"></span></button>',
            class: 'trash',
            click: function () {
                $container.remove();
            }
        }));

        $customfields = $('<div class="customfields"></div>' )
            .appendTo( $container );

        if( fields.length == 0 )
        {
            this.addCustomField();
        }
        else for( var i in fields )
        {
            fields[i].draw( $customfields );
        }

        $container.append( Segmentation.Button({
                //text: 'Add field',
                html: '<span class="dashicons dashicons-plus"></span>',
                click: function () {
                    self.addCustomField();
                }
            }));
    }
}

/**
 * Un custom field de MailPoet
 */
Segmentation.CustomField = function()
{
    var $ = jQuery ;
    var self = this ;

    var $container, $selector, $params ;

    this.draw = function( $parent )
    {
        $container = $('<div class="customfield"><div class="operator operator-or">OU</div></div>')
            .appendTo( $parent );
        if( $container.index() == 0 )
            $('.operator', $container).hide();

        $selector = $('<select class="type ui-selectmenu-button ui-button ui-widget ui-corner-all" />')
            .appendTo( $container )
            .on('change', function(ev)
            {
                var f = Segmentation.cfData[
                    $( $selector.prop('selectedOptions')[0] )
                        .data('idx')
                ];
                createField( f, $params );
            });
        $.each( Segmentation.cfData, function( k, v )
        {
            $selector.append($('<option>',
            { 
                value: v.id, text: v.name, 'data-idx': k
            }));
        });

        $container.append( Segmentation.Button({
            class: 'trash',
            html: '<span class="dashicons dashicons-trash"></span></button>',
            click: function () {
                $container.remove();
            }
        }));

        $params = $('<div class="params"></div>')
            .appendTo( $container );
    }

    function createField( field, $parent )
    {
        switch( field.type )
        {
            case 'checkbox':
                (new Segmentation.CustomField.Checkbox( field ))
                    .draw($parent);
                break;
            case 'select':
                    (new Segmentation.CustomField.Select( field ))
                        .draw($parent);
                    break;
            default:
                throw new Error( 'Field type "'+field.type+'" not implemented !');
                break;
        }
    }
}

Segmentation.CustomField.Text = function()
{
}

Segmentation.CustomField.Radio = function()
{

}

Segmentation.CustomField.Select = function( field )
{
    var $ = jQuery ;

    console.debug( field );

    this.draw = function( $parent )
    {
        $parent.children().remove();

        var name_prefix = /* a unique name */
            $parent.parents('.segment').index()
            + '-' + $parent.parent('.customfield').index()
            + '-' + field.id ;

        var values = field.params.values ;
        var $p = $('<p/>')
            .appendTo( $parent );
        for( var i in values )
        {
            var name = name_prefix +'_'+i ;
            $p.append(
                ' <label for="'+name+'">'+values[i].value+':</label>'
                +' <input type="checkbox" name="'+name+'" id="'+name+'" value="1" />'    
            );
        }
    }
}

Segmentation.CustomField.Checkbox = function( field )
{
    var $ = jQuery ;

    console.debug( field );

    this.draw = function( $parent )
    {
        $parent.children().remove();

        var $t = $('<p>'+field.params.values[0].value+'</p>')
            .appendTo($parent);
        /*
        var $t = $('<p><strong>'+field.params.values[0].value+'</strong>:</p>')
            .appendTo($parent);

        var name = // a unique name
            $parent.parents('.segment').index()
            + '-' + $parent.parent('.customfield').index()
            + '-' + field.id ;
        */
        /*$t.append(
             ' <label for="'+name+'_1">Oui:</label>'
            +' <input type="radio" name="'+name+'" id="'+name+'_1" value="1" checked="checked"/>'
            +' <label for="'+name+'_0">Non:</label>'
            +' <input type="radio" name="'+name+'" id="'+name+'_0" value="0" />'
        );*/

        /*$t.append(
            ' <label for="'+name+'_1">Oui:</label>'
           +' <input type="radio" name="'+name+'" id="'+name+'_1" value="1" checked="checked" readonly="readonly"/>'
       );*/

    }
}

Segmentation.Button = function( options )
{
    var conf = {
        class: 'ui-button ui-corner-all ui-widget',
    };
    for( var opt in options)
    {
        switch( opt )
        {
            case 'class':
                conf[opt] += ' '+options[opt]
                break;
            default:
                conf[opt] = options[opt]
        }
    }
    return jQuery('<button/>', conf );
}

jQuery(function($)
{
    //console.debug('ajaxurl: ' + ajaxurl);
    console.debug('mpSegEx: ', mpSegEx);

/*
    // Search for
    // <button type="button" class="mailpoet-button" data-automation-id="email-submit"><span>Send</span></button>
    var $sendBtn = $('button[data-automation-id="email-submit"]');
    if(  $sendBtn.length == 0 )
        return ;
    console.debug('newsletter.js', 'sendBtn', $sendBtn.length);
*/

    var $modal = create_modal();

    $modal.dialog('open');

    var data = {
        'action': 'getMPCustomFields',
    };
    $.ajax( ajaxurl,
		{
			method: 'POST',
            dataType: 'json',
			data: data,
			xhrFields:
			{
            }
        })
        .done(function( data )
        {
            console.debug('ajax success.', data);
            Segmentation.cfData = data ;
            var segmentation = new Segmentation( $('.segmentation', $modal) );
            segmentation.draw();    
        })
        .fail(function( jqXHR, textStatus, errorThrown )
        {
            console.error('ajax fail', textStatus, errorThrown);
        })
        .always(function()
        {
            console.debug('ajax done.')
        })

    function create_modal()
    {
        $(document.body).append( ''
            +'<div id="mpsegex" class="hidden">'
            +' <p>Pour qu’un·e abonné·e soit sélectionné·e il faut que tous les "ensembles de choix" soient "vrais".<br/>'
            +' Un "ensemble de choix" est "vrai" quand une des propositions qu’il contient est "vraie".</p>'
            +' <div class="segmentation">'
            +' </div>'
            +'</div>'
        );
        // https://api.jqueryui.com/dialog/
        return $('#mpsegex').dialog({
                title: 'Segmentation',
                dialogClass: 'wp-dialog',
                autoOpen: false,
                draggable: true,
                width: 'auto',
                modal: true,
                resizable: true,
                closeOnEscape: true,
                position: {
                    my: 'center',
                    at: 'center',
                    of: window
                },
                buttons: {
                    'Close': function() {
                        $(this).dialog('close');
                    }
                },
                open: function( event, ui )
                {

                }
            });
    }

});
