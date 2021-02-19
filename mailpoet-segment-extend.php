<?php
/**
 * @package           mailpoet-segment-extend
 * @author            Cyrille37
 * @copyright         2021 by the contributors
 * @license           GPL-3.0-or-later (Wordpress compatible)
 *
 * @wordpress-plugin
 * Plugin Name:       Mailpoet Segment Extended
 * Plugin URI:        https://github.com/Cyrille37/mailpoet-segment-extend
 * Description:       Extends Mailpoet subscribers segmentation
 * Version:           1.0.0
 * Requires at least: 5.2
 * Requires PHP:      7.3
 * Author:            Cyrille37 & contributors
 * Author URI:        https://artefacts.coop
 * Text Domain:       mp-segex
 * License:           GPL v3 or later (Wordpress compatible)
 * License URI:       http://www.gnu.org/licenses/gpl-3.0.html
 */

if( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/*
if( php_sapi_name() == 'cli' )
{
}

if( defined( 'DOING_CRON' ) && DOING_CRON )
{
}

if ( defined( 'WP_CLI' ) && WP_CLI )
{
}
*/

/*
error_log(
    'method:'.($_SERVER['REQUEST_METHOD'] ?? null)
    .', uri:'.$_SERVER['REQUEST_URI']
    .', is_admin:'.(is_admin()?'1':'0')
    .', is_blog_admin:'.(is_blog_admin()?'1':'0')
    .', action:'.(isset($_REQUEST['action'])?$_REQUEST['action']:'null')
    .', doing_ajax:'.( defined('DOING_AJAX') && DOING_AJAX ? '1': '0' )
);
*/

if( is_admin() )
{
    require_once(__DIR__.'/src/Admin/Admin.php' );
    $admin = \Artefacts\Mailpoet\Segment\Admin\Admin::getInstance() ;
}
else
{

}
