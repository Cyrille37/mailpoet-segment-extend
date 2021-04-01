/**
 * segmentation.js
 */
"use strict";

var Segmentation = function( segmentationCallback, options )
{
    console.debug('Segmentation loading...');

    var $ = jQuery ;
    var self = this ;

    var config = {
        segmentNamePrefix: 'DF-',
        segmentType: null,
        newsletter_id: null,
    };
    if( options )
        for( var i in options )
        {
            console.debug( i, options[i] );
            config[i] = options[i] ;
        };

    if( ! config.segmentType )
    {
        alert('ERROR segmentType invalid');
        return ;
    }
    if( ! config.newsletter_id )
    {
        alert('ERROR newsletter_id invalid');
        return ;
    }

    /**
     * Un ensemble de segments
     * dans lequel sera appliqué un "ET".
     */
    var segments = [];
    var $segments ;
    var $tools ;
    var $container ;

    this.cfData ;

    createDialog();

    this.getSegments = function()
    {
        return segments ;
    }

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


    function createDialog()
    {
        $(document.body).append( ''
            +'<div id="mpsegex" class="hidden">'
            +' <div class="loader hidden"><img src="/wp-content/plugins/mailpoet-segment-extend/admin/loader.gif" /></div>'
            +' <p>À partir de la liste: "<b>'+config.newsletter_label+'</b>"</p>'
            +' <p>Nom du segment: <input class="segment_name" type="text" size="30" value="" />'
            +'  <span class="segment_name_generate dashicons dashicons-admin-generic" title="Générer un nom de segment"></span></p>'
            +' <p>Pour qu’un·e abonné·e soit sélectionné·e il faut que tous les "ensembles de choix" soient "vrais".<br/>'
            +'  Un "ensemble de choix" est "vrai" quand une des propositions qu’il contient est "vraie".</p>'
            +' <div class="segmentation">'
            +' </div>'
            +'</div>'
        );
        // https://api.jqueryui.com/dialog/
        var $modal = $('#mpsegex').dialog({
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
                    'Annuler': function() {
                        $(this).dialog('close');
                    },
                    'Enregistrer le segment': function() {
                        self.saveSegmentation( $modal );
                    }
                },
                open: function( event, ui )
                {

                }
            });
        $modal.dialog('open');

        $('.segment_name_generate', $modal ).on('click',function()
        {
            var dateStr = (new Date()).toISOString().replace(/^(.*)T(.*)\.\d+Z$/, '$1 $2');
            var segment_name = config.segmentNamePrefix + dateStr;
            $('.segment_name',$modal).val(segment_name);
        })
        .trigger('click');

        $container = $('.segmentation', $modal)

        var ajax_data = {
            'action': 'getMPCustomFields',
        };
        $.ajax( ajaxurl,
            {
                method: 'POST',
                dataType: 'json',
                data: ajax_data,
                xhrFields:
                {
                }
            })
            .done(function( data )
            {
                console.debug('ajax success.', ajax_data.action, data);
                Segmentation.cfData = data ;
                self.draw();
            })
            .fail(function( jqXHR, textStatus, errorThrown )
            {
                console.error('ajax fail', textStatus, errorThrown);
            })
            .always(function()
            {
            });
    }

    /**
     * Create the MailPoet Dynamic Segment
     * at 'dynamic_segments' MP ajax endpoint.
     */
    this.saveSegmentation = function( $modal )
    {
        var segments_data = [];

        var segment_name = $('.segment_name', $('#mpsegex')).val();
        console.debug('segment_name:',segment_name);
        if( ! segment_name || segment_name.length < 10 )
        {
            alert('Nom du segment invalide. Il doit faire au moins 10 caractères');
            $('.segment_name', $('#mpsegex')).focus();
            return ;
        }

        // Iterate segments and their customFields,
        // check if they are valid,
        // and fill segments_data.
        var fieldsValid = true ;

        self.getSegments().forEach( function(seg, idx)
        {
            var segment = [];
            segments_data.push( segment );
            console.debug('Segment', idx, seg);
            seg.getFields().forEach( function(field, idx)
            {
                if( ! field.valid() )
                {
                    fieldsValid = false ;
                    return ;
                }
                var cf = field.getField() ;
                segment.push({
                    cf_id: cf.getField().id,
                    values: cf.getValue(),
                });
            });
        });

        if( ! fieldsValid )
            return ;
        //console.debug('segments_data', segments_data );

        //var dateStr = (new Date()).toISOString().replace(/^(.*)T(.*)\.\d+Z$/, '$1 $2');
        //segment_name = config.segmentNamePrefix + dateStr;

        var segment_desc = 'Segmentation créée le ' + (new Date()).toISOString().replace(/^(.*)T(.*)\.\d+Z$/, '$1 $2') ;

        var token = window.mailpoet_token ;

        var ajax_data = {
            action: 'mailpoet',
            api_version: 'v1',
            token: token,
            endpoint: 'dynamic_segments',
            method: 'save',
            data: {
                name: segment_name,
                description: segment_desc,
                segments: segments_data,
                newsletter_id: config.newsletter_id,
                segmentType: config.segmentType
            }
        };

        console.debug('ajax_data:', ajax_data );

        $.ajax( ajaxurl,
            {
                method: 'POST',
                dataType: 'json',
                data: ajax_data,
                xhrFields:
                {
                }
            })
            .done(function( data )
            {
                console.debug('ajax success.', data);
                $modal.dialog('close');
                
                //segmentationCallback( data );
                setTimeout( segmentationCallback, 50, data );

            })
            .fail(function( jqXHR, textStatus, errorThrown )
            {
                console.error('ajax fail', textStatus, errorThrown);
                alert( 'Error:' + errorThrown );
            })
            .always(function()
            {
            });

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

    this.getFields = function()
    {
        return fields ;
    }

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

    var field = null ;

    this.getField = function()
    {
        return field ;
    }

    this.valid = function()
    {
        if( field && field.valid() )
        {
            $container.removeClass('error');
            return true ;
        }
        $container.addClass('error');
        return false ;
    }

    this.childValueChanged = function()
    {
        self.valid();
    }

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
        $selector.append('<option value="" disabled selected hidden>Choisir une donnée</option>');
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

    function createField( z_field, $parent )
    {
        switch( z_field.type )
        {
            case 'checkbox':
                field = (new Segmentation.CustomField.Checkbox( z_field, self.childValueChanged ));
                field.draw($parent);
                break;
            case 'select':
                field = (new Segmentation.CustomField.Select( z_field, self.childValueChanged ));
                field.draw($parent);
                break;
            default:
                throw new Error( 'Field type "'+z_field.type+'" not implemented !');
                break;
        }
        $container.removeClass('error');
    }
}

Segmentation.CustomField.Text = function()
{
    this.draw = function( $parent )
    {
        throw new TypeError('NOT IMPLEMENTED');
    }
}

Segmentation.CustomField.Radio = function()
{
    this.draw = function( $parent )
    {
        throw new TypeError('NOT IMPLEMENTED');
    }
}

Segmentation.CustomField.Select = function( field, valueChanged )
{
    var $ = jQuery ;
    var $container ;

    this.getField = function()
    {
        return field ;
    }

    this.valid = function()
    {
        return( this.getValue().length > 0 ? true : false );
    }

    this.getValue = function()
    {
        var values = [];
        $('input:checked', $container).each( function( idx, el )
        {
            values.push( $(el).val() );
        });
        return values ;
    }

    this.draw = function( $parent )
    {
        $parent.children().remove();

        var name_prefix = /* a unique name */
            $parent.parents('.segment').index()
            + '-' + $parent.parent('.customfield').index()
            + '-' + field.id ;

        var values = field.params.values ;
        $container = $('<p data-field-idx="'+field.id+'"/>')
            .appendTo( $parent );
        for( var i in values )
        {
            var name = name_prefix +'_'+i ;
            $('<label for="'+name+'">'+values[i].value+':</label>')
                .appendTo( $container );
            $('<input type="checkbox" id="'+name+'" value="'+values[i].value+'" />')
                .appendTo( $container );
        }
        $('input:checkbox', $container).change( function()
        {
            if( valueChanged !== undefined )
                valueChanged();
        });
    }
}

Segmentation.CustomField.Checkbox = function( field )
{
    var $ = jQuery ;

    this.getField = function()
    {
        return field ;
    }

    this.getValue = function()
    {
        return 1 ;
    }

    this.valid = function()
    {
        return 1 ;
    }

    this.draw = function( $parent )
    {
        $parent.children().remove();

        var $t = $('<p data-field-idx="'+field.id+'">'+field.params.values[0].value+'</p>')
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
