#!/bin/bash

/app/docker/scripts/lc/sync-tauri-apps.sh
/app/docker/scripts/setup-windows-msvc-target.sh

# Run original command
exec "$@"