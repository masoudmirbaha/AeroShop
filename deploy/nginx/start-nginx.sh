#!/bin/sh
# AeroShop nginx entrypoint. NGINX_MODE must be exactly bootstrap or production.
# Do not infer mode from certificate files. Do not wipe unmanaged conf.d entries.
set -eu

conf_dir=/etc/nginx/conf.d
cert_dir=/etc/letsencrypt/live/ntopiran.ir
src_dir=/etc/nginx/aeroshop

http_dst="$conf_dir/00-aeroshop-http.conf"
https_dst="$conf_dir/10-aeroshop-https.conf"

http_boot_src="$src_dir/http-bootstrap.conf"
http_prod_src="$src_dir/http.conf"
https_prod_src="$src_dir/https.conf"

mode="${NGINX_MODE:-}"
staging_http=""
staging_https=""

die() {
  echo "start-nginx: STOP: $*" >&2
  exit 1
}

cleanup_staging() {
  if [ -n "$staging_http" ]; then
    if [ -e "$staging_http" ] || [ -L "$staging_http" ]; then
      rm -f "$staging_http" || true
    fi
  fi
  if [ -n "$staging_https" ]; then
    if [ -e "$staging_https" ] || [ -L "$staging_https" ]; then
      rm -f "$staging_https" || true
    fi
  fi
}

# Reject any unmanaged regular file, directory, or symlink (including broken).
assert_only_allowed() {
  for path in "$conf_dir"/* "$conf_dir"/.[!.]* "$conf_dir"/..?*; do
    [ -e "$path" ] || [ -L "$path" ] || continue
    base=${path##*/}
    case "$base" in
      .|..) continue ;;
    esac
    allowed=0
    for name in "$@"; do
      if [ "$base" = "$name" ]; then
        allowed=1
        break
      fi
    done
    if [ "$allowed" -ne 1 ]; then
      die "unmanaged entry in configuration directory: $base"
    fi
    if [ -L "$path" ]; then
      die "symlink not allowed in configuration directory: $base"
    fi
    if [ ! -f "$path" ]; then
      die "non-regular entry in configuration directory: $base"
    fi
  done
}

require_readable_file() {
  path=$1
  label=$2
  [ -f "$path" ] || die "missing required $label"
  [ -s "$path" ] || die "required $label is empty"
}

stage_copy() {
  src=$1
  staging=$2
  if ! cp "$src" "$staging"; then
    cleanup_staging
    die "failed to stage configuration"
  fi
  if [ ! -s "$staging" ]; then
    cleanup_staging
    die "staged configuration is empty"
  fi
}

# Validate mode and sources before changing any destination files.
case "$mode" in
  bootstrap)
    require_readable_file "$http_boot_src" "bootstrap HTTP configuration"
    ;;
  production)
    require_readable_file "$http_prod_src" "production HTTP configuration"
    require_readable_file "$https_prod_src" "production HTTPS configuration"
    require_readable_file "$cert_dir/fullchain.pem" "TLS fullchain mount"
    require_readable_file "$cert_dir/privkey.pem" "TLS private-key mount"
    ;;
  "")
    die "NGINX_MODE is unset; set to bootstrap or production"
    ;;
  *)
    die "NGINX_MODE is invalid; set to bootstrap or production"
    ;;
esac

# Remove only AeroShop-owned final destinations (exact names), never wildcards.
# Do this after source validation and before the allowlist check so a leftover
# owned file from a prior partial start cannot wedge startup, while foreign
# entries still cause fail-closed refusal (they are never deleted here).
# conf.d is expected to be an exclusive empty tmpfs (Compose). Emptiness alone
# does not prove the mount type — that remains NOT VERIFIED without image/runtime checks.
rm -f "$http_dst" "$https_dst" || die "failed to clear owned destination configs"
assert_only_allowed

case "$mode" in
  bootstrap)
    echo "start-nginx: mode=bootstrap"
    staging_http="$conf_dir/.staging-00-aeroshop-http.conf.$$"
    stage_copy "$http_boot_src" "$staging_http"
    mv "$staging_http" "$http_dst" || {
      cleanup_staging
      die "failed to install bootstrap HTTP configuration"
    }
    staging_http=""
    assert_only_allowed 00-aeroshop-http.conf
    ;;
  production)
    echo "start-nginx: mode=production"
    staging_http="$conf_dir/.staging-00-aeroshop-http.conf.$$"
    staging_https="$conf_dir/.staging-10-aeroshop-https.conf.$$"
    stage_copy "$http_prod_src" "$staging_http"
    stage_copy "$https_prod_src" "$staging_https"
    mv "$staging_http" "$http_dst" || {
      cleanup_staging
      rm -f "$http_dst" "$https_dst" || true
      die "failed to install production HTTP configuration"
    }
    staging_http=""
    mv "$staging_https" "$https_dst" || {
      cleanup_staging
      rm -f "$http_dst" "$https_dst" || true
      die "failed to install production HTTPS configuration"
    }
    staging_https=""
    assert_only_allowed 00-aeroshop-http.conf 10-aeroshop-https.conf
    ;;
esac

if ! nginx -t; then
  rm -f "$http_dst" "$https_dst" || true
  cleanup_staging
  die "nginx -t failed; not starting"
fi

echo "start-nginx: nginx -t ok; starting nginx"
exec nginx -g 'daemon off;'
