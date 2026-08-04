# —————————————————————————————————————————————————————————————————————————————
# —— Utils ————————————————————————————————————————————————————————————————————
# —————————————————————————————————————————————————————————————————————————————

# Extract and export UID/GID from shell, fallback to 1000
UID ?= $(shell id -u 2>/dev/null || echo 1000)
GID ?= $(shell id -g 2>/dev/null || echo 1000)
export UID
export GID

# Extract and export XDG_RUNTIME_DIR from shell, fallback to /run/user/<UID>
XDG_RUNTIME_DIR ?= $(shell echo $$XDG_RUNTIME_DIR 2>/dev/null || echo /run/user/$(UID))
export XDG_RUNTIME_DIR

# Build node_modules on any package.json changes
node_modules: package.json $(wildcard apps/*/package.json packages/*/package.json)
	@docker compose run --rm dev pnpm install
	@[ -d $@ ] && touch $@ || true

# Args
SERVICES_WITH_TARGETS := dev dev-lc-windows dev-lc-android
BUNDLE_FLAG = $(if $(filter 1 true,$(bundle)), ,--no-bundle)
DEBUG_FLAG = $(if $(filter 1 true,$(release)), ,--debug)
NOCACHE_FLAG = $(if $(filter 1 true,$(nocache)),--no-cache,)
ALL_FLAG = $(if $(filter 1 true,$(all)),--all,)

# —————————————————————————————————————————————————————————————————————————————
# —— Commands —————————————————————————————————————————————————————————————————
# —————————————————————————————————————————————————————————————————————————————

.DEFAULT_GOAL:=help
c ?= --help
target ?= editor
windows_variant ?= online
android_format ?= apk

##
## —— Docker ——————————————————————————————————————————————————————————————————

.PHONY: clear
clear: ## Down docker services and clear volumes
	@docker compose down -v --remove-orphans

.PHONY: prune
prune: clear ## Prune lc project (images, volumes) (?all)
	@echo "Cleaning $(if $(filter 1 true,$(all)),,"dangling") images (project=lc)..."
	@docker image prune -f $(ALL_FLAG) --filter "label=project=lc"
	@echo "\nCleaning volumes (project=lc)..."
	@docker volume prune -f --filter "label=project=lc"

.PHONY: rebuild
rebuild: ## Rebuild existing images (?nocache)
	@for service in $(SERVICES_WITH_TARGETS); do \
		if [ -n "$$(docker images -q lc:$$service 2>/dev/null)" ]; then \
			echo "\nBuilding service: $$service..."; \
			docker compose build --pull $(NOCACHE_FLAG) $$service; \
		fi \
	done
	@echo "\nCleaning dangling images (project=lc)..."
	@docker image prune -f --filter "label=project=lc"

.PHONY: update-node
update-node: ## Update node target (with pnpm)
	@docker build --target node --pull --no-cache --label "project=lc" -t lc:node .
	@for service in $(SERVICES_WITH_TARGETS); do \
		if [ -n "$$(docker images -q lc:$$service 2>/dev/null)" ]; then \
			echo "\nUpdating service: $$service..."; \
			docker compose build $$service; \
		fi \
	done

##
## —— Dev (with HMR) ——————————————————————————————————————————————————————————

.PHONY: web
web: node_modules ## Start web server (?target)
	@docker compose run --rm \
		-w /app/apps/lifecompanion \
		dev-host \
		pnpm ${target}:dev

.PHONY: linux
linux: node_modules ## Launch Linux app (Wayland) (?target)
	@docker compose run --rm --service-ports \
		-w /app/apps/lifecompanion/src-tauri/$(target) \
		-v ${XDG_RUNTIME_DIR}/wayland-0:/tmp/wayland-0 \
		-e XDG_RUNTIME_DIR=/tmp \
		dev-lc-tauri \
		cargo tauri dev

.PHONY: linux-x
linux-x: node_modules ## Launch Linux app (x11) (?target)
	@set -e; \
	if command -v xhost >/dev/null 2>&1; then \
		xhost +SI:localuser:$$USER; \
	  	trap 'xhost -SI:localuser:$$USER' EXIT INT TERM; \
	fi; \
	docker compose run --rm --service-ports \
		-w /app/apps/lifecompanion/src-tauri/$(target) \
	  	-e DISPLAY=$$DISPLAY \
	  	-e GDK_BACKEND=x11 \
	  	-e QT_QPA_PLATFORM=xcb \
	  	-v /tmp/.X11-unix:/tmp/.X11-unix \
	  	dev-lc-tauri \
	  	cargo tauri dev

# Android
.PHONY: android
android: node_modules ## Launch Android app (?target) (?ip)
	@docker compose run --rm \
		-v /dev/bus/usb:/dev/bus/usb \
		-e GRADLE_USER_HOME=/home/user/.gradle/$(target) \
		dev-lc-android \
		sh docker/scripts/lc/android-dev.sh $(target) $(ip)

##
## —— Build (unsigned)  ———————————————————————————————————————————————————————

.PHONY: build-linux
build-linux: node_modules ## Build linux (?target) (?bundle) (?relase)
	@docker compose run --rm \
		-w /app/apps/lifecompanion/src-tauri/$(target) \
		dev-lc-tauri \
		cargo tauri build \
		$(BUNDLE_FLAG) \
		$(DEBUG_FLAG)

.PHONY: build-windows
build-windows: node_modules ## Build windows (?target) (?windows_variant) (?bundle) (?release)
	@docker compose run --rm \
		-w /app/apps/lifecompanion/src-tauri/$(target) \
		-e TAURI_PLATFORM=windows \
		dev-lc-windows \
		cargo tauri build \
		--target x86_64-pc-windows-msvc \
		--config tauri.windows-$(windows_variant).conf.json \
		$(BUNDLE_FLAG) \
		$(DEBUG_FLAG)

.PHONY: build-android
build-android: node_modules ## Build android (?target) (?android_format) (?release)
	@docker compose run --rm \
		-w /app/apps/lifecompanion/src-tauri/$(target) \
		-e GRADLE_USER_HOME=/home/user/.gradle/$(target) \
		-e TAURI_PLATFORM=android \
		dev-lc-android \
		cargo tauri android build \
		--$(android_format) \
		$(DEBUG_FLAG)

##
## —— Publish ————————————————————————————————————————————————————————————————
.PHONY: publish
publish:
	@git diff --quiet || { echo "Unstaged changes found."; exit 1; }
	@git diff --cached --quiet || { echo "Uncommitted changes found."; exit 1; }
	@$(MAKE) lc-pnpm c="version --no-git-tag-version $(c)"
	@$(MAKE) lc-cargo c="set-version --manifest-path apps/lifecompanion/src-tauri/editor/Cargo.toml $npm_package_version"
	@$(MAKE) lc-cargo c="set-version --manifest-path apps/lifecompanion/src-tauri/player/Cargo.toml $npm_package_version"
#	@git add -A
#	@git commit -m "chore: release v$(c)"
#	@git tag "v$(c)"

##
## —— Commands ————————————————————————————————————————————————————————————————

.PHONY: lc-pnpm
lc-pnpm: ## Run a pnpm command inside apps/lifecompanion (?c)
	@docker compose run --rm \
		-w /app/apps/lifecompanion \
		dev pnpm $(c)

.PHONY: lc-cargo
lc-cargo: ## Run a cargo command inside apps/lifecompanion (?c) (?target)
	@docker compose run --rm \
		-w /app/apps/lifecompanion/src-tauri/$(target) \
		dev-lc-tauri cargo $(c)

.PHONY: lc-tauri
lc-tauri: ## Run a tauri command inside apps/lifecompanion (?c) (?target)
	@docker compose run --rm \
		-w /app/apps/lifecompanion/src-tauri/$(target) \
		dev-lc-tauri cargo tauri $(c)

##
## —— Utilities ———————————————————————————————————————————————————————————————

.PHONY: check
check: ## Check (format + lint) all workspace
	@docker compose run --rm \
		dev-lc-tauri pnpm run check

.PHONY: check-biome
check-biome: ## Check (format + lint) Biome workspace
	@docker compose run --rm \
		dev pnpm run check-biome

.PHONY: check-types
check-types: ## Check ts types in workspace
	@docker compose run --rm \
		dev pnpm run check-types

.PHONY: check-cargo
check-cargo: ## Check (format + lint) Cargo workspace
	@docker compose run --rm \
		dev-lc-tauri pnpm run check-cargo

##

.PHONY: fix
fix: ## Fix (format + lint) all workspace
	@docker compose run --rm \
		dev-lc-tauri pnpm run fix

.PHONY: fix-biome
fix-biome: ## Fix (format + lint) Biome workspace
	@docker compose run --rm \
		dev pnpm run fix-biome

.PHONY: fix-cargo
fix-cargo: ## Fix (format + lint) Cargo workspace
	@docker compose run --rm \
		dev-lc-tauri pnpm run fix-cargo

##

.PHONY: check-commit-msg
check-commit-msg: ## Run checks for commit-msg GIT hook (message)
	@docker compose run --rm \
		dev pnpm commitlint --edit $(message) --verbose

##

.PHONY: bash
bash: ## Open a bash in a new dev container
	@docker compose run --rm dev bash

.PHONY: bash-host
bash-host: ## Open a bash in a new dev-host container
	@docker compose run --rm dev-host bash

.PHONY: bash-lc-windows
bash-lc-windows: ## Open a bash in a new dev-lc-windows container
	@docker compose run --rm dev-lc-windows bash

.PHONY: bash-lc-android
bash-lc-android: ## Open a bash in a new dev-lc-android container
	@docker compose run --rm dev-lc-android bash

##

.PHONY: help
help: ## Display this help
	@grep -E '(^[a-zA-Z0-9\./_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' \
		| sed -e 's/\[32m## —/[33m/' \
		| sed -e 's/\[32m## /[37m/'

##
## —— Arguments definitions (? = optional) ————————————————————————————————————
## target=(player|editor)         Specify target endpoint (default: editor)
## windows_variant=(online|offline) Specify windows variant (default: online)
## android_format=(apk|aab)       Specify android format (default: apk)
##
## bundle=(1|true)                Build with installer
## release=(1|true)               Build as release
##
## c=(command)                    Command to run (use quotes if spaces; default: --help)
## ip=(device_ip)                 Connect to device via ADB over TCP
##
## all=(1|true)                   Adds a "--all" flag
## nocache=(1|true)               Adds a "--no-cache" flag 
##
