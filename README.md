# Previewing files directly from a Gitea repo

This extension lets you preview files directly from a Gitea repo, using cleaner, future-proof URL's e.g.
* `mysite.com/preview/USER/REPO/doc/`
* `mysite.com/preview/USER/REPO/doc/screenshot.png`
* `mysite.com/preview/USER/REPO/doc/index.html`

HTML files are served using a modified version of Jerzy Głowacki's [`htmlpreview.github.io`](https://github.com/htmlpreview/htmlpreview.github.com), adapted to work from a single pre-configured domain (so CORS is no longer an issue).

Other links are translated to their Gitea-specific URL's e.g.
```
mysite.com/preview/USER/REPO/doc/screenshot.png
```
becomes
```
mysite.com/USER/REPO/raw/branch/master/doc/screenshot.png
```

The work is done by a PHP script, so your Gitea instance needs to be fronted by nginx or Apache, and the preview URL's intercepted and redirected to the script.

### Setting things up

Create a directory `preview` in your webroot, and save `preview.php` and `preview-html.js` there.

At the top of both files, configure the domain name your Gitea is using.

If you're using nginx, create a rewrite rule like this to catch preview requests, and send them to the PHP script:
```
rewrite ^/preview/(.*?)/(.*?)/(.*)$ /preview/preview.php?user=$1&repo=$2&path=$3 last ;
location /preview {
    try_files $uri $uri$is_args$args =404 ;
}
```

If you're using Apache, set up a `.htaccess` inside the `preview/` directory like this:
```
RewriteRule ^(.+?)/(.+?)/(.+?)$ preview.php?user=$1&repo=$2&path=$3 [QSA,L]
```

### How are branches handled?

Not very well :-( The `preview.php` script gets everything from `master`, but this can be changed by using a `branch` query parameter. However, AFAICT there's no way to set this when creating links.

For example, if I want to link to an HTML file from a `README.md`, I might write something like this:
```
Documentation is [here](https://mysite.com/preview/USER/REPO/doc/index.html).
```

However, if I branch the code, the preview will show the HTML file from the master branch, which is not what I want. I really need to write the Markdown something like this:
```
Documentation is [here](https://mysite.com/preview/USER/REPO/doc/index.html?branch={{CURR_BRANCH}}).
```
but this would require support from Gitea to provide the `CURR_BRANCH` value and insert it into the HTML when rendering the Markdown.
