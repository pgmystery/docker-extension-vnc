#!/bin/sh

###################################################################
#                                                                 #
#  _    __ _   __ ______     _    __ _                            #
# | |  / // | / // ____/    | |  / /(_)___  _      __ ___   _____ #
# | | / //  |/ // /   ______| | / // // _ \| | /| / // _ \ / ___/ #
# | |/ // /|  // /___/_____/| |/ // //  __/| |/ |/ //  __// /     #
# |___//_/ |_/ \____/       |___//_/ \___/ |__/|__/ \___//_/      #
#                                                                 #
###################################################################

# ==============================================================================
# Audio Support Installation + Runtime Script for Docker
# =============================================================================
# ONE-TIME SETUP: installs packages, writes a persistent config, registers
# the audio bridge as a startup service, and starts it immediately.
#
# After running this script once, audio restarts automatically every time
# the container starts.
#
# Supported package managers: apt, apk, dnf, yum, zypper, pacman
#
# Usage:
#   ./install_audio_support.sh [--audio-output] [--audio-input]
#   (no args = both enabled)
#
# Env vars honoured:
#   VNC_EXTENSION_AUDIO_OUTPUT=true|false
#   VNC_EXTENSION_AUDIO_INPUT=true|false
#   MEDIA_MTX_HOST   (default: vnc-viewer-proxy)
#   AUDIO_OUT_PORT   (default: 7900)
#   MIC_IN_PORT      (default: 8890)
#   XDG_RUNTIME_DIR  (default: /tmp/runtime)
# =============================================================================
set -eu

# =============================================================================
# Paths
# =============================================================================
readonly CONF_FILE="/etc/audio-support.conf"           # persists across restarts
readonly RUNTIME_SCRIPT="/usr/local/bin/start-audio-support.sh"

# Marker files in /etc/ (NOT /var/run – that is tmpfs and lost on restart).
# Checked by TypeScript hasAudio() to detect if audio support is installed.
readonly AUDIO_OUT_FILE="/etc/.vnc_ext_audio_output"
readonly AUDIO_IN_FILE="/etc/.vnc_ext_audio_input"

# SRT / MediaMTX configuration (written to config file)
MEDIA_MTX_HOST="${MEDIA_MTX_HOST:-vnc-viewer-proxy}"
AUDIO_OUT_PORT="${AUDIO_OUT_PORT:-7900}"
MIC_IN_PORT="${MIC_IN_PORT:-8890}"

# PulseAudio runtime paths (user mode – matches start-vnc.sh)
PA_HOME="${HOME:-/root}"
XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/tmp/runtime}"
PULSE_RUNTIME_PATH="${XDG_RUNTIME_DIR}/pulse"
PA_SOCKET="${PULSE_RUNTIME_PATH}/native"

SCRIPT_VERSION="2.1.0"

# =============================================================================
# Logging
# =============================================================================
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log_info()  { printf "${GREEN}[INFO]${NC}  %s\n" "$*"; }
log_warn()  { printf "${YELLOW}[WARN]${NC}  %s\n" "$*"; }
log_error() { printf "${RED}[ERROR]${NC} %s\n" "$*" >&2; }
log_debug() { printf "${CYAN}[DEBUG]${NC} %s\n" "$*"; }
log_step()  { printf "\n${BOLD}==> %s${NC}\n" "$*"; }
log_ts()    { printf "[%s] %s\n" "$(date +'%H:%M:%S')" "$*"; }

die() { log_error "$*"; exit 1; }

# =============================================================================
# Startup banner
# =============================================================================
log_step "Audio Support Installer v${SCRIPT_VERSION}"
log_debug "PID:             $$"
log_debug "User:            $(id)"
log_debug "HOME:            ${PA_HOME}"
log_debug "XDG_RUNTIME_DIR: ${XDG_RUNTIME_DIR}"
log_debug "PA_SOCKET:       ${PA_SOCKET}"
log_debug "MEDIA_MTX_HOST:  ${MEDIA_MTX_HOST}"
log_debug "AUDIO_OUT_PORT:  ${AUDIO_OUT_PORT}"
log_debug "MIC_IN_PORT:     ${MIC_IN_PORT}"
if [ -r /etc/os-release ]; then
    # shellcheck source=/dev/null
    . /etc/os-release
    log_debug "OS:              ${PRETTY_NAME:-unknown}"
fi
log_debug "Kernel:          $(uname -r 2>/dev/null || echo unknown)"

# =============================================================================
# 1. Root check
# =============================================================================
[ "$(id -u)" -eq 0 ] || die "This script must be run as root."

# Extra sanity check for Debian/Ubuntu images: dpkg/apt requires 'root' to exist.
# Some images intentionally don't have a resolvable root user, which breaks dpkg-statoverride.
if command -v dpkg >/dev/null 2>&1; then
    if ! getent passwd root >/dev/null 2>&1; then
        die "This image has no resolvable 'root' user (getent passwd root failed). APT/dpkg installs will not work here. Use a derived image with dependencies preinstalled, or a runtime-only approach if binaries already exist."
    fi
fi

# =============================================================================
# 2. Parse arguments + environment
# =============================================================================
ENABLE_OUTPUT=false
ENABLE_INPUT=false

# --- Preserve existing installation state (important for "install input later") ---
# If the user already installed output (or input) previously, do NOT disable it
# just because this run only requested the other feature.
if [ -f "${CONF_FILE}" ]; then
    # shellcheck source=/dev/null
    . "${CONF_FILE}" 2>/dev/null || true
fi

# Marker files are the most reliable "already installed" signal
[ -f "${AUDIO_OUT_FILE}" ] && ENABLE_OUTPUT=true
[ -f "${AUDIO_IN_FILE}" ] && ENABLE_INPUT=true

REQUESTED_ANY=false
for arg in "$@"; do
    case "${arg}" in
        --audio-output) ENABLE_OUTPUT=true; REQUESTED_ANY=true ;;
        --audio-input)  ENABLE_INPUT=true;  REQUESTED_ANY=true ;;
        --help|-h)
            printf "Usage: %s [--audio-output] [--audio-input]\n" "$0"
            printf "  (no args enables both)\n"
            exit 0
            ;;
        *) log_warn "Unknown argument: ${arg}" ;;
    esac
done

# Enable both when no flags are given (keep existing behaviour)
if [ "${REQUESTED_ANY}" = false ]; then
    # If nothing was installed previously, default to both (original behaviour)
    if [ "${ENABLE_OUTPUT}" = false ] && [ "${ENABLE_INPUT}" = false ]; then
        log_info "No flags given – enabling both audio output and input."
        ENABLE_OUTPUT=true
        ENABLE_INPUT=true
    else
        log_info "No flags given – keeping existing audio config (output/input already installed)."
    fi
fi

# Also honour Docker env vars (only ever enabling, never disabling)
[ "${VNC_EXTENSION_AUDIO_OUTPUT:-}" = "true" ] && ENABLE_OUTPUT=true
[ "${VNC_EXTENSION_AUDIO_INPUT:-}"  = "true" ] && ENABLE_INPUT=true

log_info "Audio Output: ${ENABLE_OUTPUT}"
log_info "Audio Input:  ${ENABLE_INPUT}"

if [ "${ENABLE_OUTPUT}" = false ] && [ "${ENABLE_INPUT}" = false ]; then
    log_warn "Nothing to do – exiting."
    exit 0
fi

# =============================================================================
# 3. Detect package manager + distro
# =============================================================================
log_step "Detecting package manager"

PKG_MANAGER=""
DISTRO_FAMILY=""

if   command -v apt-get >/dev/null 2>&1; then PKG_MANAGER="apt";    DISTRO_FAMILY="debian"
elif command -v apk     >/dev/null 2>&1; then PKG_MANAGER="apk";    DISTRO_FAMILY="alpine"
elif command -v dnf     >/dev/null 2>&1; then PKG_MANAGER="dnf";    DISTRO_FAMILY="fedora"
elif command -v yum     >/dev/null 2>&1; then PKG_MANAGER="yum";    DISTRO_FAMILY="fedora"
elif command -v zypper  >/dev/null 2>&1; then PKG_MANAGER="zypper"; DISTRO_FAMILY="suse"
elif command -v pacman  >/dev/null 2>&1; then PKG_MANAGER="pacman"; DISTRO_FAMILY="arch"
else
    die "No supported package manager found (apt/apk/dnf/yum/zypper/pacman)."
fi

log_info "Package manager: ${PKG_MANAGER} (${DISTRO_FAMILY})"

# Per-distro package names
case "${DISTRO_FAMILY}" in
    arch)   PKG_PACTL="libpulse" ;;   # pactl ships in libpulse on Arch
    *)      PKG_PACTL="pulseaudio-utils" ;;
esac

# =============================================================================
# 4. Install missing packages
# =============================================================================
log_step "Checking / installing dependencies"

install_packages() {
    pkgs="$*"
    log_info "Installing: ${pkgs}"
    case "${PKG_MANAGER}" in
        apt)
            DEBIAN_FRONTEND=noninteractive apt-get update -qq
            DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ${pkgs}
            apt-get clean && rm -rf /var/lib/apt/lists/*
            ;;
        apk)
            apk update --quiet
            apk add --no-cache ${pkgs}
            ;;
        dnf|yum)
            "${PKG_MANAGER}" install -y ${pkgs}
            "${PKG_MANAGER}" clean all
            ;;
        zypper)
            zypper --non-interactive install --no-recommends ${pkgs}
            ;;
        pacman)
            pacman -Sy --noconfirm ${pkgs}
            ;;
    esac
}

REQUIRED_PACKAGES=""

if ! command -v pulseaudio >/dev/null 2>&1; then
    log_debug "pulseaudio not found → will install"
    REQUIRED_PACKAGES="${REQUIRED_PACKAGES} pulseaudio"
else
    log_debug "pulseaudio: $(pulseaudio --version 2>&1 | head -1 || true)"
fi

if ! command -v pactl >/dev/null 2>&1; then
    log_debug "pactl not found → will install ${PKG_PACTL}"
    REQUIRED_PACKAGES="${REQUIRED_PACKAGES} ${PKG_PACTL}"
else
    log_debug "pactl: $(pactl --version 2>&1 | head -1 || true)"
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
    log_debug "ffmpeg not found → will install"
    REQUIRED_PACKAGES="${REQUIRED_PACKAGES} ffmpeg"
else
    log_debug "ffmpeg: $(ffmpeg -version 2>&1 | head -1 || true)"
fi

if [ -n "${REQUIRED_PACKAGES}" ]; then
    install_packages ${REQUIRED_PACKAGES}
else
    log_info "All required packages already installed."
fi

# Validate tools
for cmd in pulseaudio pactl ffmpeg; do
    command -v "${cmd}" >/dev/null 2>&1 \
        || die "'${cmd}' is not available after installation. Check your distro's repos."
done
log_info "Tool validation passed."

# =============================================================================
# 5. Write persistent config (survives container restarts)
# =============================================================================
log_step "Writing persistent config to ${CONF_FILE}"

cat > "${CONF_FILE}" <<EOF
# Audio Support Configuration
# Written by install_audio_support.sh – do not edit manually.
ENABLE_OUTPUT=${ENABLE_OUTPUT}
ENABLE_INPUT=${ENABLE_INPUT}
MEDIA_MTX_HOST=${MEDIA_MTX_HOST}
AUDIO_OUT_PORT=${AUDIO_OUT_PORT}
MIC_IN_PORT=${MIC_IN_PORT}
PA_HOME=${PA_HOME}
XDG_RUNTIME_DIR=${XDG_RUNTIME_DIR}
EOF

log_info "Config saved to ${CONF_FILE}"

# =============================================================================
# 6. Write user-mode PulseAudio base config
# =============================================================================
log_step "Writing PulseAudio user-mode config"

mkdir -p "${PA_HOME}/.config/pulse"

cat > "${PA_HOME}/.config/pulse/daemon.conf" <<EOF
daemonize = yes
system-instance = no
allow-exit = no
exit-idle-time = -1
enable-shm = no
realtime-scheduling = no
EOF

# client.conf is written by the runtime script (references dynamic socket path)
log_debug "daemon.conf written to ${PA_HOME}/.config/pulse/daemon.conf"

# =============================================================================
# 7. User/group setup
# =============================================================================
if ! getent group pulse-access >/dev/null 2>&1; then
    log_info "Creating pulse-access group..."
    case "${DISTRO_FAMILY}" in
        alpine) addgroup -S pulse-access 2>/dev/null || true ;;
        *)      groupadd -f pulse-access ;;
    esac
fi
usermod -aG pulse-access root 2>/dev/null \
    || log_warn "Could not add root to pulse-access group (non-fatal)."

# =============================================================================
# 8. Write the runtime startup script
# =============================================================================
log_step "Writing runtime startup script to ${RUNTIME_SCRIPT}"

cat > "${RUNTIME_SCRIPT}" <<'RUNTIME_EOF'
#!/bin/sh
# =============================================================================
# Audio Support Runtime Script
# Generated by install_audio_support.sh
# Runs at every container start – DO NOT edit this file directly.
# Change /etc/audio-support.conf or re-run the installer instead.
# =============================================================================
set -eu

# --- Load persistent config --------------------------------------------------
CONF_FILE="/etc/audio-support.conf"
if [ ! -f "${CONF_FILE}" ]; then
    printf "[ERROR] Config file not found: %s\n" "${CONF_FILE}" >&2
    printf "[ERROR] Please re-run install_audio_support.sh\n" >&2
    exit 1
fi
# shellcheck source=/dev/null
. "${CONF_FILE}"

# Logging
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
log_info()  { printf "${GREEN}[audio]${NC} %s\n" "$*"; }
log_warn()  { printf "${YELLOW}[audio]${NC} %s\n" "$*"; }
log_error() { printf "${RED}[audio]${NC} %s\n" "$*" >&2; }
log_debug() { printf "${CYAN}[audio]${NC} %s\n" "$*"; }
log_ts()    { printf "[%s][audio] %s\n" "$(date +'%H:%M:%S')" "$*"; }

log_info "==========================================="
log_info "Audio Support starting (PID $$)"
log_info "Output: ${ENABLE_OUTPUT}  |  Input: ${ENABLE_INPUT}"
log_info "==========================================="

if [ "${ENABLE_OUTPUT}" = false ] && [ "${ENABLE_INPUT}" = false ]; then
    log_warn "Nothing enabled in config – exiting."
    exit 0
fi

# --- Environment (match start-vnc.sh) ----------------------------------------
export HOME="${PA_HOME:-/root}"
export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/tmp/runtime}"
mkdir -p "${XDG_RUNTIME_DIR}"
chmod 700 "${XDG_RUNTIME_DIR}"

export PULSE_RUNTIME_PATH="${XDG_RUNTIME_DIR}/pulse"
export PULSE_SERVER="unix:${PULSE_RUNTIME_PATH}/native"
PA_SOCKET="${PULSE_RUNTIME_PATH}/native"

# Ensure PulseAudio config matches start-vnc.sh
mkdir -p "${HOME}/.config/pulse"
cat > "${HOME}/.config/pulse/daemon.conf" <<'EOF'
daemonize = yes
system-instance = no
allow-exit = no
exit-idle-time = -1
enable-shm = no
realtime-scheduling = no
EOF

cat > "${HOME}/.config/pulse/client.conf" <<EOF
autospawn = no
default-server = ${PULSE_SERVER}
EOF

wait_for_pa() {
    sock="$1"
    log_info "Waiting for PulseAudio socket: ${sock}"
    i=0
    while [ ! -S "${sock}" ]; do
        i=$((i + 1))
        if [ "${i}" -gt 60 ]; then
            log_error "Timeout waiting for PulseAudio socket!"
            ls -la "${PULSE_RUNTIME_PATH}" 2>&1 || true
            return 1
        fi
        sleep 0.25
    done
    return 0
}

# --- Key change: do NOT restart PulseAudio if it's already reachable ----------
# If pactl can talk to a running daemon, keep it (apps won't lose audio routing).
if pactl info >/dev/null 2>&1; then
    log_info "PulseAudio already running and reachable – reusing existing daemon."
else
    log_warn "PulseAudio not reachable – starting a fresh instance..."

    # Clean stale runtime before starting a new daemon
    rm -rf "${PULSE_RUNTIME_PATH}" /var/run/pulse 2>/dev/null || true
    mkdir -p "${PULSE_RUNTIME_PATH}"
    chmod 700 "${PULSE_RUNTIME_PATH}"

    # If a daemon is running but not reachable, stop it (fallback only)
    pulseaudio --check >/dev/null 2>&1 && pulseaudio -k 2>/dev/null || true
    sleep 0.2

    if ! pulseaudio --daemonize=yes --log-target=stderr --realtime=no; then
        log_error "PulseAudio failed to start."
        exit 1
    fi

    if ! wait_for_pa "${PA_SOCKET}"; then
        log_error "PulseAudio socket never appeared."
        exit 1
    fi
fi

log_debug "$(pactl info 2>&1 || true)"

# --- Helper: wait for a sink/source ------------------------------------------
wait_for_sink() {
    name="$1"; i=0
    until pactl list short sinks 2>/dev/null | awk '{print $2}' | grep -qx "${name}"; do
        i=$((i + 1))
        [ "${i}" -gt 40 ] && { log_error "Sink '${name}' never appeared."; return 1; }
        sleep 0.25
    done
}
wait_for_source() {
    name="$1"; i=0
    until pactl list short sources 2>/dev/null | awk '{print $2}' | grep -qx "${name}"; do
        i=$((i + 1))
        [ "${i}" -gt 40 ] && { log_error "Source '${name}' never appeared."; return 1; }
        sleep 0.25
    done
}

# --- Create virtual audio devices --------------------------------------------
if [ "${ENABLE_OUTPUT}" = true ]; then
    if ! pactl list short sinks 2>/dev/null | awk '{print $2}' | grep -qx "virtual_sink"; then
        log_info "Creating virtual_sink..."
        pactl load-module module-null-sink \
            sink_name=virtual_sink \
            sink_properties=device.description=Virtual_Sink
        wait_for_sink "virtual_sink"
    fi
    pactl set-default-sink virtual_sink
    log_info "virtual_sink ready."
fi

if [ "${ENABLE_INPUT}" = true ]; then
    if ! pactl list short sinks 2>/dev/null | awk '{print $2}' | grep -qx "mic_sink"; then
        log_info "Creating mic_sink..."
        pactl load-module module-null-sink \
            sink_name=mic_sink \
            sink_properties=device.description=Virtual_Mic_Input
        wait_for_sink "mic_sink"
    fi
    if ! pactl list short sources 2>/dev/null | awk '{print $2}' | grep -qx "virtmic"; then
        log_info "Creating virtmic (remap-source)..."
        pactl load-module module-remap-source \
            master=mic_sink.monitor \
            source_name=virtmic \
            source_properties=device.description=Virtual_Microphone
        wait_for_source "virtmic"
    fi
    pactl set-default-source virtmic
    log_info "virtmic ready."
fi

log_debug "Sinks:   $(pactl list short sinks   2>&1 || true)"
log_debug "Sources: $(pactl list short sources 2>&1 || true)"

# --- Prevent duplicate FFmpeg loops when script is re-run -----------------------
# Re-running install (or startAudioIfInstalled) can spawn multiple background
# FFmpeg processes that fight over ports and/or Pulse devices.
if command -v pkill >/dev/null 2>&1; then
    if [ "${ENABLE_OUTPUT}" = true ]; then
        pkill -f "srt://0.0.0.0:${AUDIO_OUT_PORT}.*mode=listener" 2>/dev/null || true
    fi
    if [ "${ENABLE_INPUT}" = true ]; then
        pkill -f "streamid=read:mic" 2>/dev/null || true
    fi
fi

# --- FFmpeg supervisor loops -------------------------------------------------
_audio_output_loop() {
    set +e
    while true; do
        log_ts "FFmpeg audio output starting..."
        ffmpeg -loglevel error -nostdin \
            -f pulse -i "virtual_sink.monitor" \
            -c:a libopus -b:a 96k -vbr off -compression_level 5 \
            -frame_duration 10 -application lowdelay \
            -f mpegts -pes_payload_size 0 -flush_packets 1 \
            "srt://0.0.0.0:${AUDIO_OUT_PORT}?mode=listener&latency=0"
        log_ts "FFmpeg (audio output) exited ($?). Restarting in 1s..."
        sleep 1
    done
}

_mic_input_loop() {
  set +e

  # This tells the underlying SRT library to only speak if there is a fatal error
  export SRT_LOG_LEVEL=error

  log "🎤 Starting FFmpeg supervisor (virtual mic input)..."
  while true; do
    # 1. Check if the proxy is even there
    if ! ffmpeg -v quiet -t 1 -i "srt://vnc-viewer-proxy:8890?streamid=read:mic" -f null - 2>/dev/null; then
      sleep 2
      continue
    fi

    ffmpeg -loglevel error -nostdin -v quiet \
      -i "srt://vnc-viewer-proxy:8890?streamid=read:mic&latency=0" \
      -c:a pcm_s16le -ar 48000 -ac 2 \
      -f pulse "mic_sink"

    sleep 2
  done
}

if [ "${ENABLE_OUTPUT}" = true ]; then
    ( _audio_output_loop & )
    log_info "Audio output loop running in background."
fi

if [ "${ENABLE_INPUT}" = true ]; then
    ( _mic_input_loop & )
    log_info "Mic input loop running in background."
fi

log_info "Audio bridge active. Exiting startup script."
RUNTIME_EOF

chmod +x "${RUNTIME_SCRIPT}"
log_info "Runtime script written to ${RUNTIME_SCRIPT}"

# =============================================================================
# 8b. Create persistent audio marker files
# =============================================================================
# These are checked by the TypeScript fileExists() call in hasAudio().
# They live in /etc/ so they survive container stop/start.
log_step "Creating audio marker files"
[ "${ENABLE_OUTPUT}" = true ] && { touch "${AUDIO_OUT_FILE}"; log_info "Created: ${AUDIO_OUT_FILE}"; }
[ "${ENABLE_INPUT}"  = true ] && { touch "${AUDIO_IN_FILE}";  log_info "Created: ${AUDIO_IN_FILE}";  }

# =============================================================================
# 9. Register as a startup service (auto-start on container restart)
# =============================================================================
log_step "Registering audio support as a startup service"

SERVICE_REGISTERED=false

# --- Try systemd (Debian, Ubuntu, Fedora, RHEL, openSUSE) -------------------
if command -v systemctl >/dev/null 2>&1 && systemctl --version >/dev/null 2>&1; then
    log_info "systemd detected – registering audio-support.service"
    cat > /etc/systemd/system/audio-support.service <<EOF
[Unit]
Description=VNC Audio Support (PulseAudio + FFmpeg bridge)
After=network.target

[Service]
Type=forking
ExecStart=${RUNTIME_SCRIPT}
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload 2>/dev/null || true
    systemctl enable audio-support 2>/dev/null \
        && log_info "systemd service enabled." \
        || log_warn "systemctl enable failed (non-fatal; may work at next boot)."
    SERVICE_REGISTERED=true
fi

# --- Try OpenRC (Alpine Linux) -----------------------------------------------
if [ "${SERVICE_REGISTERED}" = false ] && command -v rc-update >/dev/null 2>&1; then
    log_info "OpenRC detected – registering audio-support init script"
    cat > /etc/init.d/audio-support <<EOF
#!/sbin/openrc-run
description="VNC Audio Support (PulseAudio + FFmpeg bridge)"

depend() {
    after net
}

start() {
    ebegin "Starting audio support"
    "${RUNTIME_SCRIPT}"
    eend \$?
}
EOF
    chmod +x /etc/init.d/audio-support
    rc-update add audio-support default 2>/dev/null \
        && log_info "OpenRC service registered." \
        || log_warn "rc-update add failed (non-fatal)."
    SERVICE_REGISTERED=true
fi

# --- Fallback: /etc/rc.local -------------------------------------------------
if [ "${SERVICE_REGISTERED}" = false ]; then
    log_info "Falling back to /etc/rc.local"
    if [ ! -f /etc/rc.local ]; then
        cat > /etc/rc.local <<'EOF'
#!/bin/sh
# rc.local – commands to run at startup
exit 0
EOF
        chmod +x /etc/rc.local
    fi

    if ! grep -q "start-audio-support" /etc/rc.local 2>/dev/null; then
        # Insert before the final 'exit 0' line
        sed -i '/^exit 0/i '"${RUNTIME_SCRIPT}" /etc/rc.local
        log_info "Added ${RUNTIME_SCRIPT} to /etc/rc.local"
    else
        log_debug "Already present in /etc/rc.local – skipping."
    fi
    SERVICE_REGISTERED=true
fi

# =============================================================================
# 10. Start audio support immediately (no need to reboot)
# =============================================================================
log_step "Starting audio support right now"
log_info "Running ${RUNTIME_SCRIPT}..."
"${RUNTIME_SCRIPT}"

log_info ""
log_info "============================================================"
log_info " Installation complete!"
log_info " Audio will start automatically on every container restart."
log_info " Config file: ${CONF_FILE}"
log_info " Runtime script: ${RUNTIME_SCRIPT}"
log_info "============================================================"
