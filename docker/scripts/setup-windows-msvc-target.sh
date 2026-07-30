#!/bin/bash

CARGO_CONFIG="/app/.cargo/config.toml"

# Clean up existing config
if [ -f "$CARGO_CONFIG" ]; then
    sed -i '/# START MSVC CONFIG/,/# END MSVC CONFIG/d' "$CARGO_CONFIG"
fi

# Find Windows SDK paths
CRT_LIB=$(find /opt/xwin/crt/lib -type d -name "x86_64" | head -n 1)
UM_LIB=$(find /opt/xwin/sdk/lib/um -type d -name "x86_64" | head -n 1)
UCRT_LIB=$(find /opt/xwin/sdk/lib/ucrt -type d -name "x86_64" | head -n 1)

# Inject fresh configuration
mkdir -p "$(dirname "$CARGO_CONFIG")"

cat <<EOF >> "$CARGO_CONFIG"

# START MSVC CONFIG
[target.x86_64-pc-windows-msvc]
linker = "lld-link"
rustflags = [
    "-Lnative=$CRT_LIB",
    "-Lnative=$UM_LIB",
    "-Lnative=$UCRT_LIB",
]
# END MSVC CONFIG
EOF

# Cleanup file
sed -i '/^$/N;/\n$/D' "$CARGO_CONFIG"
