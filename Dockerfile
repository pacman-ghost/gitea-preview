FROM nginx:stable-alpine

RUN apk add --no-cache php-fpm && \
    sed 's/^;clear_env/clear_env/' -i /etc/php8/php-fpm.d/www.conf

COPY /docker /
COPY /preview* /usr/share/nginx/html/preview/
ENV DEFAULT_BRANCH=main
ENV BASE_URL=https://mysite.com

EXPOSE 80
CMD ["/bin/sh", "-c", "php-fpm8 && nginx -g 'daemon off;'"]