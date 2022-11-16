<?php

// NOTE: There is a rewrite rule that sends $/preview/USER/REPO/PATH to here.

// initialize
define( "BASE_URL", "https://mysite.com" ) ; // <== put your Gitea's domain name here

// get the target arguments
$user = $_GET[ "user" ] ; // nb: user or organization
$repo = $_GET[ "repo" ] ;
$branch = $_GET[ "branch" ] ?? "master" ;
$path = $_GET[ "path" ] ;
if ( $path[0] === "/" )
    $path = substr( $path, 1 ) ;
if ( ! $user || ! $repo || ! $branch || ! $path ) {
    http_response_code( 404 ) ;
    // NOTE: The 404 error page is not shown, but it's more trouble than it's worth :-/
    die() ;
}

// redirect to the appropriate target
if ( substr( $path, -1 ) === "/" )
    $dest = BASE_URL . "/$user/$repo/src/branch/$branch/$path" ;
else {
    $extn = pathinfo( $path, PATHINFO_EXTENSION ) ;
    if ( $extn == "html" ) {
        print "<script src='/preview/preview-html.js'></script>\n" ;
        $url = BASE_URL . "/$user/$repo/raw/branch/$branch/$path" ;
        print "<script> previewHtml( '$url' ) ; </script>\n" ;
        exit() ;
    } else if ( $extn == "md" )
        $dest = BASE_URL . "/$user/$repo/src/branch/$branch/$path" ;
    else
        $dest = BASE_URL . "/$user/$repo/raw/branch/$branch/$path" ;
}
header( "Location: $dest" ) ;

?>
