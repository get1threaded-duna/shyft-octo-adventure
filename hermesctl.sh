#!/usr/bin/env bash
# hermesctl — gateway → tunnel → bridge lifecycle manager for Juggernaut
# Usage:
#   ./hermesctl.sh init     write ~/.hermes/hermesctl.env (first-time setup)
#   ./hermesctl.sh start    boot gateway + tunnel + bridge with health checks
#   ./hermesctl.sh stop     kill all managed processes
#   ./hermesctl.sh status   print process + URL state
#   ./hermesctl.sh doctor   validate env, deps, and port availability
#   ./hermesctl.sh logs     tail logs for all three services

set -euo pipefail

# ── dirs & paths ──────────────────────────────────────────────────────────────
HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
ENV_FILE="$HERMES_HOME/hermesctl.env"
PID_DIR="$HERMES_HOME/pids"
LOG_DIR="$HERMES_HOME/logs"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$PID_DIR" "$LOG_DIR"

# ── colour helpers ─────────────────────────────────────────────────────────────
_bold()    { printf '\033[1m%s\033[0m' "$*"; }
_green()   { printf '\033[32m%s\033[0m' "$*"; }
_yellow()  { printf '\033[33m%s\033[0m' "$*"; }
_red()     { printf '\033[31m%s\033[0m' "$*"; }
_cyan()    { printf '\033[36m%s\033[0m' "$*"; }
_dim()     { printf '\033[2m%s\033[0m'  "$*"; }

ok()   { echo "  $(_green '✓') $*"; }
warn() { echo "  $(_yellow '⚠') $*"; }
err()  { echo "  $(_red '✗') $*"; }
info() { echo "  $(_cyan '→') $*"; }

# ── load env (if it exists) ────────────────────────────────────────────────────
_load_env() {
  if [[ -f "$ENV_FILE" ]]; then
    # shellcheck source=/dev/null
    set -a; source "$ENV_FILE"; set +a
  fi
}

# ── subcommand: init ───────────────────────────────────────────────────────────
cmd_init() {
  echo
  echo "$(_bold 'hermesctl init')"
  echo

  if [[ -f "$ENV_FILE" ]]; then
    warn "Env file already exists at $ENV_FILE"
    read -r -p "  Overwrite? [y/N] " reply
    [[ "$(echo "$reply" | tr '[:upper:]' '[:lower:]')" == "y" ]] || { info "Keeping existing file."; return 0; }
  fi

  mkdir -p "$HERMES_HOME"

  cat > "$ENV_FILE" <<'EOF'
# ── Juggernaut / hermesctl environment ────────────────────────────────────────
# Edit this file, then run: ./hermesctl.sh start

# ── Gateway (Next.js) ─────────────────────────────────────────────────────────
# Absolute path to the project root (the directory containing package.json)
HERMES_GATEWAY_DIR=__SCRIPT_DIR__

# Port the Next.js dev server listens on
HERMES_GATEWAY_PORT=3000

# "dev" uses `npm run dev`; "prod" uses `npm run build && npm run start`
HERMES_GATEWAY_MODE=dev

# ── Tunnel ────────────────────────────────────────────────────────────────────
# Which tunnel backend to use: "cloudflared" | "ngrok" | "static"
# - cloudflared: zero-config, free, auto-assigns a *.trycloudflare.com URL
# - ngrok:       requires HERMES_NGROK_AUTHTOKEN; stable subdomain with paid plan
# - static:      you manage the tunnel; set HERMES_TUNNEL_URL manually
HERMES_TUNNEL_BACKEND=cloudflared

# Only used when HERMES_TUNNEL_BACKEND=static (or for ngrok stable subdomain)
HERMES_TUNNEL_URL=https://your-tunnel.example.com

# ngrok auth token — get it at https://dashboard.ngrok.com/get-started/your-authtoken
HERMES_NGROK_AUTHTOKEN=

# Optional: ngrok stable subdomain (requires paid plan)
HERMES_NGROK_SUBDOMAIN=

# ── Bridge (OAuth-aware proxy, port 4000) ─────────────────────────────────────
# The bridge is a lightweight Node.js proxy that:
#   1. Listens for Expo/mobile requests on HERMES_BRIDGE_PORT
#   2. Forwards them to the gateway via the tunnel URL
#   3. Injects OAuth bearer tokens on outbound requests
HERMES_BRIDGE_PORT=4000

# OAuth provider: "google" | "github" | "none"
HERMES_OAUTH_PROVIDER=none

# OAuth application credentials (from your provider's developer console)
HERMES_OAUTH_CLIENT_ID=
HERMES_OAUTH_CLIENT_SECRET=

# Redirect URI registered with your OAuth provider
HERMES_OAUTH_REDIRECT_URI=http://localhost:4000/oauth/callback

# A long random string used to sign session tokens (run: openssl rand -hex 32)
HERMES_SESSION_SECRET=

# ── Anthropic ─────────────────────────────────────────────────────────────────
# Required for /api/analysis — get your key at https://console.anthropic.com
ANTHROPIC_API_KEY=

# ── Health checks ─────────────────────────────────────────────────────────────
# Seconds to wait for each service to become healthy before giving up
HERMES_HEALTH_TIMEOUT=30

# Path hit on the gateway to verify it is up
HERMES_HEALTH_PATH=/api/prices?tickers=SPY
EOF

  # Patch in the real script dir (perl works on both macOS and Linux)
  perl -pi -e "s|__SCRIPT_DIR__|${SCRIPT_DIR}|g" "$ENV_FILE"

  chmod 600 "$ENV_FILE"
  ok "Wrote $ENV_FILE  $(_dim '(mode 600)')"
  echo
  echo "  Next steps:"
  echo "    1. Fill in $(_bold 'ANTHROPIC_API_KEY') (required for analysis)"
  echo "    2. Set $(_bold 'HERMES_TUNNEL_BACKEND') (cloudflared requires no config)"
  echo "    3. Set OAuth fields if you want mobile auth ($(_dim 'HERMES_OAUTH_PROVIDER=none skips it'))"
  echo "    4. Run: $(_bold './hermesctl.sh start')"
  echo
}

# ── subcommand: doctor ─────────────────────────────────────────────────────────
cmd_doctor() {
  local ok_count=0 warn_count=0 err_count=0

  echo
  echo "$(_bold 'hermesctl doctor')"
  echo

  # --- env file ---
  echo "$(_bold 'Environment')"
  if [[ -f "$ENV_FILE" ]]; then
    ok "Env file found: $ENV_FILE"
    ok_count=$((ok_count + 1))
    _load_env
  else
    err "Env file missing — run: ./hermesctl.sh init"
    err_count=$((err_count + 1))
  fi

  # --- required env vars ---
  echo
  echo "$(_bold 'Required variables')"
  _check_var() {
    local var="$1" label="$2"
    if [[ -n "${!var:-}" ]]; then
      ok "$label ($var)"
      ok_count=$((ok_count + 1))
    else
      err "$label ($var) is not set"
      err_count=$((err_count + 1))
    fi
  }
  _check_var HERMES_GATEWAY_DIR    "Gateway directory"
  _check_var HERMES_GATEWAY_PORT   "Gateway port"
  _check_var HERMES_BRIDGE_PORT    "Bridge port"
  _check_var ANTHROPIC_API_KEY     "Anthropic API key"

  # --- optional but important ---
  echo
  echo "$(_bold 'Optional variables')"
  if [[ -n "${HERMES_SESSION_SECRET:-}" ]]; then
    ok "Session secret set"
  else
    warn "HERMES_SESSION_SECRET not set — bridge sessions will not persist across restarts"
    warn_count=$((warn_count + 1))
  fi
  if [[ "${HERMES_OAUTH_PROVIDER:-none}" == "none" ]]; then
    ok "OAuth disabled (HERMES_OAUTH_PROVIDER=none)"
  elif [[ -n "${HERMES_OAUTH_CLIENT_ID:-}" && -n "${HERMES_OAUTH_CLIENT_SECRET:-}" ]]; then
    ok "OAuth credentials set"
  else
    err "OAuth enabled but CLIENT_ID/SECRET missing"
    err_count=$((err_count + 1))
  fi

  # --- system dependencies ---
  echo
  echo "$(_bold 'Dependencies')"
  _check_cmd() {
    local cmd="$1" label="${2:-$1}" hint="${3:-}"
    if command -v "$cmd" &>/dev/null; then
      ok "$label: $(command -v "$cmd")"
      ok_count=$((ok_count + 1))
    else
      if [[ -n "$hint" ]]; then
        warn "$label not found — $hint  (non-fatal if using $(_dim 'static') tunnel)"
        warn_count=$((warn_count + 1))
      else
        err "$label not found"
        err_count=$((err_count + 1))
      fi
    fi
  }
  _check_cmd node  "Node.js"
  _check_cmd npm   "npm"
  _check_cmd curl  "curl"

  local tunnel_backend="${HERMES_TUNNEL_BACKEND:-cloudflared}"
  case "$tunnel_backend" in
    cloudflared) _check_cmd cloudflared "cloudflared" "brew install cloudflared  OR  https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/";;
    ngrok)       _check_cmd ngrok "ngrok" "brew install ngrok  OR  https://ngrok.com/download";;
    static)      ok "Tunnel backend: static (no binary needed)";;
    *)           err "Unknown HERMES_TUNNEL_BACKEND: $tunnel_backend";;
  esac

  # --- ports ---
  echo
  echo "$(_bold 'Port availability')"
  _check_port() {
    local port="$1" name="$2"
    # Try lsof first, fall back to ss/netstat
    local in_use=false
    if command -v lsof &>/dev/null; then
      lsof -iTCP:"$port" -sTCP:LISTEN -t &>/dev/null && in_use=true || true
    elif command -v ss &>/dev/null; then
      ss -tln "sport = :$port" 2>/dev/null | grep -q ":$port" && in_use=true || true
    fi
    if $in_use; then
      warn "Port $port ($name) is already in use"
      warn_count=$((warn_count + 1))
    else
      ok "Port $port ($name) is free"
      ok_count=$((ok_count + 1))
    fi
  }
  _check_port "${HERMES_GATEWAY_PORT:-3000}" "gateway"
  _check_port "${HERMES_BRIDGE_PORT:-4000}"  "bridge"

  # --- gateway dir ---
  echo
  echo "$(_bold 'Gateway')"
  local gw_dir="${HERMES_GATEWAY_DIR:-$SCRIPT_DIR}"
  if [[ -f "$gw_dir/package.json" ]]; then
    ok "package.json found in $gw_dir"
    ok_count=$((ok_count + 1))
  else
    err "No package.json in HERMES_GATEWAY_DIR ($gw_dir)"
    err_count=$((err_count + 1))
  fi

  # --- mobile ---
  echo
  echo "$(_bold 'Mobile (Expo)')"
  if [[ -f "$gw_dir/mobile/package.json" ]]; then
    ok "mobile/package.json found"
    ok_count=$((ok_count + 1))
  else
    warn "mobile/ not found — mobile bridge will still work for API clients"
    warn_count=$((warn_count + 1))
  fi

  # --- summary ---
  echo
  echo "  $(_bold 'Summary:')  $(_green "$ok_count ok")  $(_yellow "$warn_count warnings")  $(_red "$err_count errors")"
  echo

  [[ $err_count -eq 0 ]]
}

# ── helpers: PID management ────────────────────────────────────────────────────
_pid_file() { echo "$PID_DIR/$1.pid"; }
_log_file()  { echo "$LOG_DIR/$1.log"; }

_save_pid() { echo "$1" > "$(_pid_file "$2")"; }
_read_pid() { local f; f="$(_pid_file "$1")"; [[ -f "$f" ]] && cat "$f" || echo ""; }

_is_running() {
  local pid; pid="$(_read_pid "$1")"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

_stop_service() {
  local name="$1"
  local pid; pid="$(_read_pid "$name")"
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    # wait briefly for graceful exit
    local i=0
    while kill -0 "$pid" 2>/dev/null && (( i++ < 15 )); do sleep 0.2; done
    kill -9 "$pid" 2>/dev/null || true
    ok "Stopped $name (pid $pid)"
  else
    _dim "  $name was not running"
  fi
  rm -f "$(_pid_file "$name")"
}

# ── helpers: health check ──────────────────────────────────────────────────────
_wait_for_http() {
  local url="$1" timeout="${2:-30}" label="${3:-service}"
  local i=0
  info "Waiting for $label to be healthy at $url ..."
  while (( i++ < timeout )); do
    if curl -sf --max-time 2 "$url" &>/dev/null; then
      ok "$label is up"
      return 0
    fi
    sleep 1
  done
  err "$label did not become healthy within ${timeout}s"
  return 1
}

# ── helpers: tunnel ────────────────────────────────────────────────────────────
_start_cloudflared() {
  local port="$1" logfile; logfile="$(_log_file tunnel)"
  cloudflared tunnel --url "http://localhost:$port" \
    --no-autoupdate \
    > "$logfile" 2>&1 &
  local pid=$!
  _save_pid $pid tunnel
  info "cloudflared started (pid $pid) — tailing log for URL ..."

  # cloudflared prints the URL to stderr; it shows up in logfile
  local url="" i=0
  while (( i++ < 30 )); do
    sleep 1
    url=$(grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' "$logfile" 2>/dev/null | head -1 || true)
    [[ -n "$url" ]] && break
  done

  if [[ -z "$url" ]]; then
    err "Could not detect cloudflared URL from log — check $logfile"
    return 1
  fi

  echo "$url" > "$HERMES_HOME/tunnel.url"
  ok "Tunnel URL: $(_bold "$url")"
  export HERMES_TUNNEL_URL="$url"
}

_start_ngrok() {
  local port="$1" logfile; logfile="$(_log_file tunnel)"
  local args=(http "$port" --log=stdout)
  [[ -n "${HERMES_NGROK_AUTHTOKEN:-}" ]] && ngrok config add-authtoken "$HERMES_NGROK_AUTHTOKEN" &>/dev/null
  [[ -n "${HERMES_NGROK_SUBDOMAIN:-}" ]] && args+=(--subdomain="$HERMES_NGROK_SUBDOMAIN")
  ngrok "${args[@]}" > "$logfile" 2>&1 &
  local pid=$!
  _save_pid $pid tunnel
  info "ngrok started (pid $pid) — fetching URL from local API ..."

  local url="" i=0
  while (( i++ < 20 )); do
    sleep 1
    url=$(curl -sf http://127.0.0.1:4040/api/tunnels 2>/dev/null \
          | python3 -c "import sys,json; t=json.load(sys.stdin)['tunnels']; print(next((x['public_url'] for x in t if x['proto']=='https'),''))" 2>/dev/null || true)
    [[ -n "$url" ]] && break
  done

  if [[ -z "$url" ]]; then
    err "Could not detect ngrok URL — check $logfile"
    return 1
  fi

  echo "$url" > "$HERMES_HOME/tunnel.url"
  ok "Tunnel URL: $(_bold "$url")"
  export HERMES_TUNNEL_URL="$url"
}

_start_tunnel() {
  local backend="${HERMES_TUNNEL_BACKEND:-cloudflared}"
  local port="${HERMES_GATEWAY_PORT:-3000}"

  case "$backend" in
    cloudflared) _start_cloudflared "$port";;
    ngrok)       _start_ngrok "$port";;
    static)
      if [[ -z "${HERMES_TUNNEL_URL:-}" ]]; then
        err "HERMES_TUNNEL_BACKEND=static but HERMES_TUNNEL_URL is not set"
        return 1
      fi
      echo "$HERMES_TUNNEL_URL" > "$HERMES_HOME/tunnel.url"
      ok "Tunnel URL (static): $(_bold "$HERMES_TUNNEL_URL")"
      ;;
    *)
      err "Unknown HERMES_TUNNEL_BACKEND: $backend"
      return 1
      ;;
  esac
}

# ── helpers: bridge (inline Node.js proxy) ────────────────────────────────────
_write_bridge_server() {
  local bridge_js="$HERMES_HOME/bridge-server.js"
  cat > "$bridge_js" <<'JSEOF'
#!/usr/bin/env node
// hermesctl bridge-server — OAuth-aware HTTP proxy between mobile and gateway
'use strict';
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BRIDGE_PORT  = parseInt(process.env.HERMES_BRIDGE_PORT  || '4000', 10);
const TUNNEL_URL   = (process.env.HERMES_TUNNEL_URL || '').replace(/\/$/, '');
const OAUTH_PROV   = process.env.HERMES_OAUTH_PROVIDER  || 'none';
const CLIENT_ID    = process.env.HERMES_OAUTH_CLIENT_ID  || '';
const CLIENT_SECRET= process.env.HERMES_OAUTH_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.HERMES_OAUTH_REDIRECT_URI || `http://localhost:${BRIDGE_PORT}/oauth/callback`;
const SESSION_KEY  = process.env.HERMES_SESSION_SECRET || crypto.randomBytes(32).toString('hex');

if (!TUNNEL_URL) {
  console.error('[bridge] HERMES_TUNNEL_URL is not set — cannot start');
  process.exit(1);
}

// -- simple in-memory session store --
const sessions = new Map();

function makeToken() { return crypto.randomBytes(24).toString('hex'); }

function parseBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}

// -- proxy a request to the tunnel URL --
function proxyRequest(req, res, token) {
  const parsed = url.parse(TUNNEL_URL);
  const isHttps = parsed.protocol === 'https:';
  const options = {
    hostname: parsed.hostname,
    port: parsed.port || (isHttps ? 443 : 80),
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: parsed.hostname,
      'x-hermes-bridge': '1',
    },
  };

  if (token) options.headers['authorization'] = `Bearer ${token}`;

  const transport = isHttps ? https : http;
  const upstream = transport.request(options, (upRes) => {
    res.writeHead(upRes.statusCode, {
      ...upRes.headers,
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'Authorization, Content-Type, X-Hermes-Bridge',
    });
    upRes.pipe(res);
  });

  upstream.on('error', (e) => {
    console.error('[bridge] proxy error:', e.message);
    sendJSON(res, 502, { error: 'Bad Gateway', detail: e.message });
  });

  req.pipe(upstream);
}

// -- OAuth flows (google / github / none) --
function oauthLoginURL() {
  const state = makeToken();
  if (OAUTH_PROV === 'google') {
    const p = new URLSearchParams({
      client_id: CLIENT_ID, redirect_uri: REDIRECT_URI, response_type: 'code',
      scope: 'openid email profile', state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
  }
  if (OAUTH_PROV === 'github') {
    const p = new URLSearchParams({ client_id: CLIENT_ID, redirect_uri: REDIRECT_URI, state });
    return `https://github.com/login/oauth/authorize?${p}`;
  }
  return null;
}

async function exchangeCode(code) {
  if (OAUTH_PROV === 'google') {
    const body = new URLSearchParams({
      code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI, grant_type: 'authorization_code',
    });
    const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body });
    const j = await r.json();
    return j.access_token || null;
  }
  if (OAUTH_PROV === 'github') {
    const body = new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code });
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST', body, headers: { Accept: 'application/json' },
    });
    const j = await r.json();
    return j.access_token || null;
  }
  return null;
}

// -- request handler --
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname  = parsedUrl.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'access-control-allow-headers': 'Authorization, Content-Type, X-Hermes-Bridge',
    });
    return res.end();
  }

  // health / status
  if (pathname === '/hermes/health') {
    return sendJSON(res, 200, { ok: true, tunnel: TUNNEL_URL, oauth: OAUTH_PROV, ts: Date.now() });
  }

  // OAuth initiate
  if (pathname === '/oauth/login' && OAUTH_PROV !== 'none') {
    const loginUrl = oauthLoginURL();
    if (!loginUrl) return sendJSON(res, 501, { error: 'OAuth not configured' });
    res.writeHead(302, { Location: loginUrl }); return res.end();
  }

  // OAuth callback
  if (pathname === '/oauth/callback' && OAUTH_PROV !== 'none') {
    const code  = parsedUrl.query.code;
    if (!code) return sendJSON(res, 400, { error: 'Missing code' });
    try {
      const accessToken = await exchangeCode(code);
      if (!accessToken) return sendJSON(res, 502, { error: 'Token exchange failed' });
      const sessionToken = makeToken();
      sessions.set(sessionToken, { accessToken, createdAt: Date.now() });
      // Return token — deep-link back to the Expo app
      const deepLink = `juggernaut://auth?token=${sessionToken}`;
      res.writeHead(302, { Location: deepLink }); return res.end();
    } catch (e) {
      return sendJSON(res, 500, { error: e.message });
    }
  }

  // Resolve session token for proxy
  let bearerToken = null;
  const authHeader = req.headers['authorization'] || '';
  if (authHeader.startsWith('Bearer ')) {
    const sessionToken = authHeader.slice(7);
    const session = sessions.get(sessionToken);
    if (session) bearerToken = session.accessToken;
  }

  // Proxy everything else to the gateway via the tunnel
  proxyRequest(req, res, bearerToken);
});

server.listen(BRIDGE_PORT, '0.0.0.0', () => {
  console.log(`[bridge] listening on http://0.0.0.0:${BRIDGE_PORT}`);
  console.log(`[bridge] upstream tunnel: ${TUNNEL_URL}`);
  console.log(`[bridge] OAuth provider:  ${OAUTH_PROV}`);
});

server.on('error', (e) => { console.error('[bridge] server error:', e.message); process.exit(1); });
process.on('SIGTERM', () => { server.close(); });
JSEOF
  echo "$bridge_js"
}

# ── subcommand: start ──────────────────────────────────────────────────────────
cmd_start() {
  _load_env

  echo
  echo "$(_bold 'hermesctl start')"
  echo

  # Run doctor first; abort on errors
  if ! cmd_doctor; then
    echo
    err "Doctor found errors — fix them before starting."
    echo
    exit 1
  fi

  local gw_dir="${HERMES_GATEWAY_DIR:-$SCRIPT_DIR}"
  local gw_port="${HERMES_GATEWAY_PORT:-3000}"
  local gw_mode="${HERMES_GATEWAY_MODE:-dev}"
  local bridge_port="${HERMES_BRIDGE_PORT:-4000}"
  local health_timeout="${HERMES_HEALTH_TIMEOUT:-30}"
  local health_path="${HERMES_HEALTH_PATH:-/api/prices?tickers=SPY}"

  # ── 1. Gateway ───────────────────────────────────────────────────────────────
  echo "$(_bold '1/3  Gateway')"
  if _is_running gateway; then
    warn "Gateway already running (pid $(_read_pid gateway)) — skipping"
  else
    local gw_log; gw_log="$(_log_file gateway)"
    info "Starting Next.js ($gw_mode) in $gw_dir on port $gw_port ..."

    # Export env vars that Next.js reads from the shell
    export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"

    (
      cd "$gw_dir"
      if [[ "$gw_mode" == "prod" ]]; then
        npm run build >> "$gw_log" 2>&1
        PORT="$gw_port" npm run start >> "$gw_log" 2>&1
      else
        PORT="$gw_port" npm run dev >> "$gw_log" 2>&1
      fi
    ) &
    _save_pid $! gateway

    _wait_for_http "http://localhost:$gw_port$health_path" "$health_timeout" "Gateway" \
      || { err "Gateway failed to start — check $gw_log"; exit 1; }
  fi
  echo

  # ── 2. Tunnel ────────────────────────────────────────────────────────────────
  echo "$(_bold '2/3  Tunnel')"
  if _is_running tunnel; then
    warn "Tunnel already running (pid $(_read_pid tunnel)) — skipping"
    export HERMES_TUNNEL_URL
  else
    _start_tunnel || exit 1
  fi
  echo

  # ── 3. Bridge ────────────────────────────────────────────────────────────────
  echo "$(_bold '3/3  Bridge')"
  if _is_running bridge; then
    warn "Bridge already running (pid $(_read_pid bridge)) — skipping"
  else
    local bridge_js; bridge_js="$(_write_bridge_server)"
    local bridge_log; bridge_log="$(_log_file bridge)"
    info "Starting bridge on port $bridge_port ..."

    HERMES_BRIDGE_PORT="$bridge_port" \
    HERMES_TUNNEL_URL="${HERMES_TUNNEL_URL:-}" \
    HERMES_OAUTH_PROVIDER="${HERMES_OAUTH_PROVIDER:-none}" \
    HERMES_OAUTH_CLIENT_ID="${HERMES_OAUTH_CLIENT_ID:-}" \
    HERMES_OAUTH_CLIENT_SECRET="${HERMES_OAUTH_CLIENT_SECRET:-}" \
    HERMES_OAUTH_REDIRECT_URI="${HERMES_OAUTH_REDIRECT_URI:-}" \
    HERMES_SESSION_SECRET="${HERMES_SESSION_SECRET:-}" \
    node "$bridge_js" >> "$bridge_log" 2>&1 &
    _save_pid $! bridge

    _wait_for_http "http://localhost:$bridge_port/hermes/health" "$health_timeout" "Bridge" \
      || { err "Bridge failed to start — check $bridge_log"; exit 1; }
  fi
  echo

  # ── Summary ──────────────────────────────────────────────────────────────────
  local tunnel_url; tunnel_url="$(cat "$HERMES_HOME/tunnel.url" 2>/dev/null || echo "${HERMES_TUNNEL_URL:-unknown}")"

  echo "  ┌─────────────────────────────────────────────────────────────┐"
  echo "  │  $(_bold 'Juggernaut stack is running')                              │"
  echo "  ├─────────────────────────────────────────────────────────────┤"
  printf "  │  %-14s %s\n" "Gateway:" "$(_cyan "http://localhost:$gw_port")"
  printf "  │  %-14s %s\n" "Tunnel URL:" "$(_cyan "$tunnel_url")"
  printf "  │  %-14s %s\n" "Bridge:" "$(_cyan "http://localhost:$bridge_port")"
  echo "  ├─────────────────────────────────────────────────────────────┤"
  echo "  │  Set in your Expo app:"
  printf "  │    %s\n" "$(_bold "API_BASE_URL=http://localhost:$bridge_port")"
  echo "  │  Or for real-device testing:"
  printf "  │    %s\n" "$(_bold "API_BASE_URL=$tunnel_url")"
  echo "  ├─────────────────────────────────────────────────────────────┤"
  echo "  │  Logs: $LOG_DIR/"
  echo "  │  Stop: ./hermesctl.sh stop"
  echo "  └─────────────────────────────────────────────────────────────┘"
  echo

  # Trap for clean shutdown when the terminal is closed
  trap 'cmd_stop' INT TERM EXIT
  echo "$(_dim "  Press Ctrl-C to stop all services")"
  wait
}

# ── subcommand: stop ───────────────────────────────────────────────────────────
cmd_stop() {
  echo
  echo "$(_bold 'hermesctl stop')"
  echo
  _stop_service bridge
  _stop_service tunnel
  _stop_service gateway
  rm -f "$HERMES_HOME/tunnel.url"
  echo
}

# ── subcommand: status ─────────────────────────────────────────────────────────
cmd_status() {
  _load_env
  echo
  echo "$(_bold 'hermesctl status')"
  echo

  _svc_status() {
    local name="$1"
    if _is_running "$name"; then
      ok "$name  $(_dim "pid $(_read_pid "$name")")"
    else
      err "$name  $(_dim 'not running')"
    fi
  }

  _svc_status gateway
  _svc_status tunnel
  _svc_status bridge

  local tunnel_url; tunnel_url="$(cat "$HERMES_HOME/tunnel.url" 2>/dev/null || echo "")"
  if [[ -n "$tunnel_url" ]]; then
    echo
    info "Tunnel URL: $(_cyan "$tunnel_url")"
  fi

  local bridge_port="${HERMES_BRIDGE_PORT:-4000}"
  if _is_running bridge; then
    local health; health="$(curl -sf "http://localhost:$bridge_port/hermes/health" 2>/dev/null || echo '{}')"
    echo
    info "Bridge health: $health"
  fi
  echo
}

# ── subcommand: logs ───────────────────────────────────────────────────────────
cmd_logs() {
  echo
  echo "$(_bold 'hermesctl logs')  $(_dim "(Ctrl-C to exit)")"
  echo
  tail -f \
    "$(_log_file gateway)" \
    "$(_log_file tunnel)"  \
    "$(_log_file bridge)"  \
    2>/dev/null || { err "No log files found yet — have you run 'start'?"; exit 1; }
}

# ── subcommand: agents ────────────────────────────────────────────────────────
cmd_agents() {
  _load_env
  local subcmd="${1:-list}"
  local gw_port="${HERMES_GATEWAY_PORT:-3000}"
  local base_url="http://localhost:$gw_port"

  case "$subcmd" in
    list)
      echo
      echo "$(_bold 'hermesctl agents list')"
      echo
      local result; result="$(curl -sf "$base_url/api/agents" 2>/dev/null)" || {
        err "Gateway not responding at $base_url — run: ./hermesctl.sh start"
        exit 1
      }
      # Print each agent's name + description
      echo "$result" | python3 -c "
import sys, json
data = json.load(sys.stdin)
agents = data.get('agents', [])
print(f'  {len(agents)} agent(s) available:\n')
for a in agents:
    print(f'  \033[1m{a[\"name\"]}\033[0m')
    print(f'    {a[\"description\"]}')
    req = [p for p in a.get('params', []) if p['required']]
    opt = [p for p in a.get('params', []) if not p['required']]
    if req:
        print(f'    Required: {', '.join(p[\"name\"] for p in req)}')
    if opt:
        print(f'    Optional: {', '.join(p[\"name\"] for p in opt)}')
    print()
"
      ;;

    run)
      local agent_name="${2:-}"
      if [[ -z "$agent_name" ]]; then
        err "Usage: ./hermesctl.sh agents run <agent> [key=value ...]"
        echo "       Example: ./hermesctl.sh agents run researcher topic='AI in healthcare'"
        exit 1
      fi
      shift 2

      # Build params JSON from key=value arguments
      local params_json
      params_json="$(python3 -c "
import sys, json
args = sys.argv[1:]
d = {}
for a in args:
    if '=' in a:
        k, v = a.split('=', 1)
        d[k.strip()] = v.strip()
print(json.dumps(d))
" "$@")"

      echo
      echo "$(_bold "hermesctl agents run $agent_name")"
      echo

      local payload; payload="$(python3 -c "
import json, sys
print(json.dumps({'agent': sys.argv[1], 'params': json.loads(sys.argv[2])}))
" "$agent_name" "$params_json")"

      local result; result="$(curl -sf -X POST \
        -H 'Content-Type: application/json' \
        -d "$payload" \
        "$base_url/api/agents/run" 2>/dev/null)" || {
        err "Gateway not responding at $base_url — run: ./hermesctl.sh start"
        exit 1
      }

      # Pretty-print the output field if present, else full result
      echo "$result" | python3 -c "
import sys, json

data = json.load(sys.stdin)
if 'error' in data:
    print(f'  \033[31m✗\033[0m {data[\"error\"]}')
    sys.exit(1)

agent   = data.get('agent', '')
dur     = data.get('durationMs', 0)
meta    = data.get('meta', {})
output  = data.get('output', {})

print(f'  \033[36m→\033[0m Agent: {agent}  |  {dur}ms  |  {meta.get(\"input_tokens\",0)}→{meta.get(\"output_tokens\",0)} tokens\n')
print(json.dumps(output, indent=2))
"
      ;;

    *)
      err "Unknown agents subcommand: $subcmd"
      echo "  ./hermesctl.sh agents list"
      echo "  ./hermesctl.sh agents run <agent> [key=value ...]"
      exit 1
      ;;
  esac
}

# ── dispatch ───────────────────────────────────────────────────────────────────
CMD="${1:-help}"

case "$CMD" in
  init)   cmd_init;;
  start)  cmd_start;;
  stop)   cmd_stop;;
  status) cmd_status;;
  doctor) _load_env; cmd_doctor;;
  logs)   cmd_logs;;
  agents) cmd_agents "${@:2}";;
  help|--help|-h)
    echo
    echo "$(_bold 'hermesctl') — Juggernaut gateway/tunnel/bridge manager"
    echo
    echo "  $(_bold 'Commands:')"
    echo "    init                          Write ~/.hermes/hermesctl.env with defaults"
    echo "    start                         Boot gateway → tunnel → bridge"
    echo "    stop                          Gracefully stop all managed processes"
    echo "    status                        Show running state and URLs"
    echo "    doctor                        Validate environment, deps, and ports"
    echo "    logs                          Tail live logs from all three services"
    echo "    agents list                   List available AI agents"
    echo "    agents run <agent> [k=v ...]  Run an agent with params"
    echo
    echo "  $(_bold 'Agents:')"
    echo "    researcher   Research any topic, company, or market"
    echo "    scribe       Extract structure from meetings, emails, documents"
    echo "    planner      Turn a business goal into an actionable plan"
    echo "    drafter      Draft emails, proposals, updates, and announcements"
    echo
    echo "  $(_bold 'Examples:')"
    echo "    ./hermesctl.sh agents run researcher topic='AI in healthcare' depth=detailed"
    echo "    ./hermesctl.sh agents run planner goal='Launch B2B SaaS in 90 days' horizon=90d"
    echo "    ./hermesctl.sh agents run drafter type=email intent='Follow up on proposal'"
    echo
    echo "  $(_bold 'Env file:') $ENV_FILE"
    echo "  $(_bold 'Logs:')     $LOG_DIR/"
    echo "  $(_bold 'PIDs:')     $PID_DIR/"
    echo
    ;;
  *)
    err "Unknown command: $CMD"
    echo "  Run: ./hermesctl.sh help"
    exit 1
    ;;
esac
