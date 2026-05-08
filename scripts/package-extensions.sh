#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist"
STAGING_DIR="${DIST_DIR}/.staging"

require_tool() {
  local tool="$1"

  if ! command -v "${tool}" >/dev/null 2>&1; then
    echo "Missing required build tool: ${tool}" >&2
    exit 1
  fi
}

require_file() {
  local file="$1"

  if [[ ! -f "${file}" ]]; then
    echo "Missing required extension file: ${file#${ROOT_DIR}/}" >&2
    exit 1
  fi
}

manifest_value() {
  local manifest="$1"
  local filter="$2"

  jq -r "${filter}" "${manifest}"
}

validate_firefox_manifest() {
  local manifest="$1"

  jq -e '
    .manifest_version == 3
    and .chrome_url_overrides.newtab == "newtab.html"
    and (.background.scripts | index("background.js") != null)
    and (.background.service_worker? | not)
    and (.browser_specific_settings.gecko.id | type == "string")
  ' "${manifest}" >/dev/null
}

validate_chromium_manifest() {
  local manifest="$1"

  jq -e '
    .manifest_version == 3
    and .chrome_url_overrides.newtab == "newtab.html"
    and .background.service_worker == "service-worker.js"
    and (.background.scripts? | not)
    and (.browser_specific_settings? | not)
  ' "${manifest}" >/dev/null
}

copy_source() {
  local source_path="$1"
  local package_root="$2"

  rm -rf "${package_root}"
  mkdir -p "${package_root}"

  tar \
    --exclude=".DS_Store" \
    --exclude="__MACOSX" \
    --exclude="dist" \
    -C "${source_path}" \
    -cf - . \
    | tar -C "${package_root}" -xf -
}

zip_package() {
  local package_root="$1"
  local artifact="$2"

  rm -f "${artifact}"
  (
    cd "${package_root}"
    zip -qr "${artifact}" . -x "*.DS_Store" -x "__MACOSX/*"
  )
}

build_extension() {
  local source_dir="$1"
  local browser="$2"
  local source_path="${ROOT_DIR}/${source_dir}"
  local manifest="${source_path}/manifest.json"
  local package_name
  local version
  local package_root
  local artifact

  if [[ ! -d "${source_path}" ]]; then
    echo "Missing extension source directory: ${source_dir}" >&2
    exit 1
  fi

  require_file "${manifest}"
  require_file "${source_path}/newtab.html"
  require_file "${source_path}/app.js"
  require_file "${source_path}/styles.css"

  jq empty "${manifest}" >/dev/null
  package_name="$(manifest_value "${manifest}" '.short_name // .name | ascii_downcase | gsub("[^a-z0-9]+"; "-") | gsub("(^-|-$)"; "")')"
  version="$(manifest_value "${manifest}" '.version')"
  package_root="${STAGING_DIR}/${browser}"

  case "${browser}" in
    firefox)
      require_file "${source_path}/background.js"
      validate_firefox_manifest "${manifest}"
      artifact="${DIST_DIR}/${package_name}-firefox-${version}.xpi"
      ;;
    chromium)
      require_file "${source_path}/service-worker.js"
      validate_chromium_manifest "${manifest}"
      artifact="${DIST_DIR}/${package_name}-chromium-${version}.zip"
      ;;
    *)
      echo "Unknown browser target: ${browser}" >&2
      exit 1
      ;;
  esac

  copy_source "${source_path}" "${package_root}"
  zip_package "${package_root}" "${artifact}"
  echo "Built ${artifact#${ROOT_DIR}/}"
}

require_tool jq
require_tool tar
require_tool zip

rm -rf "${DIST_DIR}"
mkdir -p "${STAGING_DIR}"

build_extension "firefox-glass-start" "firefox"
build_extension "chromium-glass-start" "chromium"

rm -rf "${STAGING_DIR}"
