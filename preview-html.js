// Adapted from here:
//  https://github.com/htmlpreview/htmlpreview.github.com
//  (c) 2019 Jerzy Głowacki under Apache License 2.0.

( function() {

DOMAIN = "mysite.com" ; // <== put your Gitea's domain name here

var replaceAssets = function () {
    var frame, a, link, links = [], script, scripts = [], i, href, src;
    //Framesets
    if (document.querySelectorAll('frameset').length)
        return; //Don't replace CSS/JS if it's a frameset, because it will be erased by document.write()
    //Frames
    frame = document.querySelectorAll('iframe[src],frame[src]');
    for (i = 0; i < frame.length; ++i) {
        src = frame[i].src; //Get absolute URL
        if ( src.indexOf( "//"+DOMAIN ) > 0 ) {
            frame[i].src = '//' + location.hostname + location.pathname + '?' + src; //Then rewrite URL so it can be loaded using CORS proxy
        }
    }
    //Links
    a = document.querySelectorAll('a[href]');
    for (i = 0; i < a.length; ++i) {
        href = a[i].href; //Get absolute URL
        if (href.indexOf('#') > 0) { //Check if it's an anchor
            a[i].href = '//' + location.hostname + location.pathname + location.search + '#' + a[i].hash.substring(1); //Then rewrite URL with support for empty anchor
        } else if ( href.indexOf( "//"+DOMAIN ) > 0 && href.indexOf( ".html" ) > 0 ) {
            a[i].href = '//' + location.hostname + location.pathname + '?' + href; //Then rewrite URL so it can be loaded using CORS proxy
        }
    }
    //Stylesheets
    link = document.querySelectorAll('link[rel=stylesheet]');
    for (i = 0; i < link.length; ++i) {
        href = link[i].href; //Get absolute URL
        if ( href.indexOf( "//"+DOMAIN ) > 0 ) {
            links.push(fetchProxy(href, null, 0)); //Then add it to links queue and fetch using CORS proxy
        }
    }
    Promise.all(links).then(function (res) {
        for (i = 0; i < res.length; ++i) {
            loadCSS(res[i]);
        }
    });
    //Scripts
    script = document.querySelectorAll('script[type="text/htmlpreview"]');
    for (i = 0; i < script.length; ++i) {
        src = script[i].src; //Get absolute URL
        if ( src.indexOf( "//"+DOMAIN ) > 0 ) {
            scripts.push(fetchProxy(src, null, 0)); //Then add it to scripts queue and fetch using CORS proxy
        } else {
            script[i].removeAttribute('type');
            scripts.push(script[i].innerHTML); //Add inline script to queue to eval in order
        }
    }
    Promise.all(scripts).then(function (res) {
        for (i = 0; i < res.length; ++i) {
            loadJS(res[i]);
        }
        document.dispatchEvent(new Event('DOMContentLoaded', {bubbles: true, cancelable: true})); //Dispatch DOMContentLoaded event after loading all scripts
    });
};

var loadHTML = function (data, url) {
    if (data) {
        data = data.replace(/<head([^>]*)>/i, '<head$1><base href="' + url + '">').replace(/<script(\s*src=["'][^"']*["'])?(\s*type=["'](text|application)\/javascript["'])?/gi, '<script type="text/htmlpreview"$1'); //Add <base> just after <head> and replace <script type="text/javascript"> with <script type="text/htmlpreview">
        setTimeout(function () {
            document.open();
            document.write(data);
            document.close();
            replaceAssets();
        }, 10); //Delay updating document to have it cleared before
    }
};

var loadCSS = function (data) {
    if (data) {
        var style = document.createElement('style');
        style.innerHTML = data;
        document.head.appendChild(style);
    }
};

var loadJS = function (data) {
    if (data) {
        var script = document.createElement('script');
        script.innerHTML = data;
        document.body.appendChild(script);
    }
};

var fetchProxy = function (url, options, i) {
    var proxy = [
        '', // try without proxy first
        //'https://api.codetabs.com/v1/proxy/?quest=' // nb: everything is same domain, so we shouldn't ever need this
    ];
    return fetch(proxy[i] + url, options).then(function (res) {
        if (!res.ok) throw new Error('Cannot load ' + url + ': ' + res.status + ' ' + res.statusText);
        return res.text();
    }).catch(function (error) {
        if (i === proxy.length - 1)
            throw error;
        return fetchProxy(url, options, i + 1);
    })
};

window.previewHtml = function( url ) {
    fetchProxy( url, null, 0 ).then(
        (data) => loadHTML( data, url )
    ).catch( function( error ) {
        document.write( "<div style='font-family:monospace;white-space:pre-wrap;'>" + error + "</div>" ) ;
    } ) ;
}

} )()
