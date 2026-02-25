#!/usr/bin/env sh
set -e

# Provide defaults if not set
: "${API_TARGET:=https://gokite-staging.odoo.com}"
: "${B2B_API_TARGET:=https://gokite-staging.odoo.com}"
: "${CORS_ALLOWED_ORIGIN:=*}"

# Extract hostnames from target URLs so nginx can send the correct Host header
# (Odoo.sh is multi-tenant and routes by Host header — sending 'localhost' breaks it)
API_HOST=$(echo "$API_TARGET" | sed 's|https\?://||' | cut -d'/' -f1)
B2B_API_HOST=$(echo "$B2B_API_TARGET" | sed 's|https\?://||' | cut -d'/' -f1)
export API_HOST B2B_API_HOST

# Replace placeholders in nginx config template
if [ -f /etc/nginx/conf.d/default.conf.template ]; then
  echo "Generating /etc/nginx/conf.d/default.conf from template"
  export API_TARGET B2B_API_TARGET CORS_ALLOWED_ORIGIN
  envsubst '${API_TARGET} ${B2B_API_TARGET} ${CORS_ALLOWED_ORIGIN} ${API_HOST} ${B2B_API_HOST}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
fi

# Start nginx in foreground
exec nginx -g 'daemon off;'
