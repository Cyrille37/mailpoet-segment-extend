<?php

namespace Artefacts\Mailpoet\Segment ;

class WPPlugin
{
    const PLUGIN_NAME = 'mp-segex' ;
    const VERSION = '1.0' ;

    protected static $debug = null ;

    protected static $plugin_dir ;
    protected static $plugin_dir_url ;
    protected static $asset_url_public ;
    protected static $asset_url_admin ;

    public static function getInstance()
    {
        static $instance ;
        if( $instance==null )
        {
            $instance = new static();
        }
        return $instance ;
    }

    protected function __construct()
    {
        self::$debug = (defined('WP_DEBUG') ? WP_DEBUG : false);
        if( self::$debug && $this->ignoreDebug() )
            self::$debug = false ;

        if( self::$debug )
            self::debug(__METHOD__,
                'method:', $_SERVER['REQUEST_METHOD'] ?? null,
                'uri:', $_SERVER['REQUEST_URI'],
                'action:', isset($_REQUEST['action'])?$_REQUEST['action']:'null',
                'doing_ajax:', self::isAjax(),
                //'globals', var_export($GLOBALS,true),
                'request', var_export($_REQUEST,true)
            );

        self::$plugin_dir = plugin_dir_path( __DIR__.'/../README.md' );
        self::$plugin_dir_url = plugin_dir_url( __DIR__.'/../README.md' );
        self::$asset_url_public = self::$plugin_dir_url.'public/';
        self::$asset_url_admin = self::$plugin_dir_url.'admin/';
        
    }

    public static function isAjax()
    {
        return( defined('DOING_AJAX') && DOING_AJAX );
    }

    protected function ignoreDebug()
    {
        $uri = $_SERVER['REQUEST_URI'];
        if( strlen($uri)>5 && strpos($uri, '.map', -5 ) !== false )
            return true ;

        $action = isset($_REQUEST['action'])?$_REQUEST['action']:null;
        switch($action)
        {
            case 'heartbeat':
            case 'oembed-cache':
                return true ;
        }

        if( isset($_REQUEST['_tracy_bar']) && isset($_REQUEST['XDEBUG_SESSION_STOP']) )
            return true ;

        return false ;
    }

    public static function debug( ...$items )
    {
        if( self::$debug == null )
            self::$debug = (defined('WP_DEBUG') ? WP_DEBUG : false);
        if( ! self::$debug )
            return ;

        $msg = '' ;
        foreach( $items as $item )
        {
            switch ( gettype($item))
            {
                case 'boolean' :
                    $msg.= ($item ? 'true':'false');
                    break;
                case 'NULL' :
                    $msg.= 'null';
                    break;
                case 'integer' :
                case 'double' :
                case 'float' :
                case 'string' :
                    $msg.= $item ;
                    break;
                default:
                    $msg .= var_export($item,true) ;
            }
            $msg.=' ';
        }
        error_log( $msg );
    }

}
