<?php

namespace Artefacts\Mailpoet\Segment\Admin ;

require_once( __DIR__.'/../WPPlugin.php');

use Artefacts\Mailpoet\Segment\WPPlugin;
use MailPoet\Models\CustomField ;

class Admin extends WPPlugin
{
    /**
     * Admin part of the plugin initializes some stuffs according to the context...
     */
    protected function __construct()
    {
        if( ! is_admin() )
            return ;

        parent::__construct();
        //static::debug(__METHOD__);

        if( self::isAjax() )
        {
            add_action( 'wp_ajax_getMPCustomFields', [$this, 'wp_ajax_getMPCustomFields']);
        }
        else if( is_blog_admin() )
        {
            if( ($_REQUEST['page'] ?? null) == 'mailpoet-newsletters'
                && ! isset($_REQUEST['endpoint'])
            )
            {
                // Hack the mailpoet newsletter page
                // Mail steps (routes) are managed at client site, with React.
                add_action( 'admin_enqueue_scripts',
                    array( $this, 'wp_admin_enqueue_scripts_newsletter' ),
                    100 );
            }
        }
        else
        {
        }
    }

    /**
     * Ask MailPoet API for CustomField collection
     * and output it as Json to serve jQuery code in Admin GUI.
     *
     * @return void
     */
    public function wp_ajax_getMPCustomFields()
    {
        $mp = \MailPoet\API\API::MP('v1');
        echo json_encode(
            $mp->getSubscriberFields()
        );
        wp_die();
    }

    public function wp_admin_enqueue_scripts_newsletter()
    {
        $wp_scripts = wp_scripts();

        $name = self::PLUGIN_NAME.'-newsletter' ;

        // load jquery-ui with "humanity" theme.

        wp_register_style('jquery-ui-humanity', self::$asset_url_admin.'jquery-ui-1.12.1.humanity/jquery-ui.theme.min.css',
            ['wp-jquery-ui-dialog'],
            '1.12.1', 'all');

        // load ours css & js.

        wp_register_style($name, self::$asset_url_admin.'newsletter.css',
            ['jquery-ui-humanity'],
            self::VERSION, 'all');
        wp_enqueue_style( $name );

        wp_register_script( $name.'-segmentation', self::$asset_url_admin . 'segmentation.js',
            ['jquery','jquery-ui-core','jquery-ui-dialog'], self::VERSION, true );
        wp_enqueue_script( $name );

        wp_register_script( $name, self::$asset_url_admin . 'newsletter.js',
            [$name.'-segmentation'], self::VERSION, true );
        wp_enqueue_script( $name );

        wp_localize_script( $name, 'mpSegEx',
        [
            'segmentType' => \MailPoet\DynamicSegments\Filters\CustomFieldFilter::SEGMENT_TYPE ,
            'newsletter_id' => 3,
        ]);
    }
}
