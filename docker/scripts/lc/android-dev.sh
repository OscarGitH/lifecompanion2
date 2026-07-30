#!/usr/bin/env bash
set -e

TARGET=$1
DEVICE_IP=$2

# Connect device through ADB TCP 
if [ -n "$DEVICE_IP" ]; then
  echo "🛜  Connecting to Android device at $DEVICE_IP:5555"

  MAX_RETRIES=10
  COUNT=0

  while [ $COUNT -lt $MAX_RETRIES ]; do
    adb connect $DEVICE_IP:5555 >/dev/null 2>&1
    if adb devices | grep -q "$DEVICE_IP.*device"; then
      echo "Device connected and authorized!"
      break
    else
      echo "Waiting for device authorization... ($((COUNT+1))/$MAX_RETRIES)"
      sleep 3
      COUNT=$((COUNT+1))
    fi
  done

  if [ $COUNT -eq $MAX_RETRIES ]; then
    echo "Failed to connect: device not authorized"
    exit 1
  fi
fi

# Adb reverse to redirect localhost to this container
echo "\n🔗 Adb reversing port..."
adb reverse tcp:1420 tcp:1420
adb reverse tcp:1421 tcp:1421

# ADB uninstall app from device
echo "\n🔴 Adb unistalling org.lifecompanion2.$TARGET..."
adb uninstall org.lifecompanion2.$TARGET || true

echo ""

# Run
cd /app/apps/lifecompanion/src-tauri/$TARGET
cargo tauri android dev --host 127.0.0.1
