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
