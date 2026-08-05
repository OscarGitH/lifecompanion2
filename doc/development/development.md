# Development

This section provides essential technical documentation for developers looking to contribute to or maintain the project.

## Requirements

To ensure a consistent development environment, the following tools are required:

- **A Linux-based system**: If you are on Windows, please follow our [WSL setup guide](wsl_setup.md).
- **[Docker Engine](https://docs.docker.com/engine/install)**: Used to containerize the application and its dependencies.
- **[GNU Make](https://www.gnu.org/software/make)**: Used to automate common development tasks via the `Makefile`.

## Optional Tools

While not strictly required to run the project, these tools will greatly improve your development experience:

- **[Rustup](https://rust-lang.org/tools/install)**: Includes `rustfmt` (bundled by default) to ensure code style consistency.  
  *Highly recommended if you use the **rust-analyzer** VS Code extension.*


## Quick Start
The project uses `make` to abstract all Docker operations.  
Service orchestration and dependencies (pnpm, cargo, etc.) are automatically managed and mounted based on the command you run.

ℹ️ On the first run, make automatically handles image builds and dependency installations. This may take a few minutes.

### 1. Explore Commands
Run the help command to see all available targets:

```sh
make         # Display help
```

### 2. Main Entry Points
Start the development environment for your platform:

```sh
make web      # Start the Web server
make linux    # Launch the Linux app (Wayland)
make android  # Launch the Android app (via ADB)
```

## Publishing updates
TODO :
- Add in Dockerfile `RUN cargo install tauri-cli cargo-edit` line 48 and rebuild.
- Add tauri tauri.windows-offline/online.conf.json in editor and player.
- Add in MakeFile 
    ```makefile
        .PHONY: publish
        publish:
            @git diff --quiet || { echo "Unstaged changes found."; exit 1; }
            @git diff --cached --quiet || { echo "Uncommitted changes found."; exit 1; }
            @$(MAKE) lc-pnpm c="version --no-git-tag-version $(c)"
            @$(MAKE) lc-cargo target="editor" c="set-version --manifest-path Cargo.toml $(c)"
            @$(MAKE) lc-cargo target="player" c="set-version --manifest-path Cargo.toml $(c)"
            @git add -A
            @git commit -m "chore: release v$(c)"
            @git tag "v$(c)"
    ```
- Add .env file at root with the following content:
    ```env
    TAURI_SIGNING_PRIVATE_KEY=...
    TAURI_SIGNING_PRIVATE_KEY_PASSWORD=...
    ```
- Look commit 9ab81659

### Build release on local machine
To build a release version of the application, complete the .env file with the TAURI_SIGNING_PRIVATE_KEY and TAURI_SIGNING_PRIVATE_KEY_PASSWORD variables.

Then run the following example command to build the Windows release:

```sh
make windows-build target=editor bundle=true release=true
```


### Deployment
To deploy a new version, just bump a new NPM version using:

make publish c="--new-version 1.0.0"

Once done, you can git push with the creating tag, and the GitHub workflow will run to build and publish the new version to the app stores.