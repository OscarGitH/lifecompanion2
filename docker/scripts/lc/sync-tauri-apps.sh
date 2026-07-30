#!/bin/bash

APPS=("player" "editor")
SHARED_CARGO="/app/apps/lifecompanion/src-tauri/shared/Cargo.toml"
SHARED_DIR="/app/apps/lifecompanion/src-tauri/shared/capabilities"

# --- DEPENDENCIES ---
echo -e "\n📦 Synchronizing shared dependencies..."

# Extract shared dependencies
SHARED_DEPS=$(sed -n '/# SHARED_DEPS_START/,/# SHARED_DEPS_END/{ /# SHARED_DEPS_START/b; /# SHARED_DEPS_END/b; p; }' "$SHARED_CARGO")

for APP in "${APPS[@]}"; do
    TARGET_CARGO="/app/apps/lifecompanion/src-tauri/$APP/Cargo.toml"
    
    if [ -f "$TARGET_CARGO" ] && [ ! -z "$SHARED_DEPS" ]; then
        # Replace children shared dependencies
        perl -i -0777 -pe "s/# SHARED_DEPS_START.*?# SHARED_DEPS_END/# SHARED_DEPS_START\n$SHARED_DEPS\n# SHARED_DEPS_END/s" "$TARGET_CARGO"
        echo "- Cargo.toml updated for $APP"
    fi
done

# --- CAPABILITIES ---
echo -e "\n📖 Synchronizing shared capabilities..."

for APP in "${APPS[@]}"; do
    TARGET_DIR="/app/apps/lifecompanion/src-tauri/$APP/capabilities"
    mkdir -p "$TARGET_DIR"
    
    if [ -d "$SHARED_DIR" ]; then
        for file in "$SHARED_DIR"/*.json; do
            filename=$(basename "$file")
            target_file="$TARGET_DIR/$filename"
            
            # Copy shared capabilities
            cp -f "$file" "$target_file"
            
            # Remove the $schema line 
            sed -i '/"\$schema":/d' "$target_file"
            
            # Inject info header 
            header="\\\t\"_info\": \"GENERATED - DO NOT EDIT. Source: shared/capabilities/$filename\","
            sed -i "2i $header" "$target_file"
            
            echo "- Capability $filename copied to $APP"
        done
    fi
done

echo ""
