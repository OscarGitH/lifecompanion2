# Windows Setup (WSL2)

This guide covers setting up a complete development environment on Windows using WSL2

## Install steps

### 1. Install Windows Subsystem for Linux (WSL)

Install WSL and a distro (the default Ubuntu distro is good enough).  
This is all you need on Windows, the rest will be installed and used inside this WSL distro.

ℹ️ WSL2 (Windows Subsystem for Linux version 2) is the current default and required version.

- [Official WSL Installation Guide](https://learn.microsoft.com/en-us/windows/wsl/install)

### 2. Install project requirements inside your WSL distro

Once your WSL terminal is ready, install the necessary tools within the Linux environment:

- [Follow the Requirements section](development.md#requirements) (Docker & GNU Make)

### 3. Clone project inside your WSL distro

⚠️ **Important**: To ensure optimal performance, the project must be stored in the **Linux file system**, not the Windows one.  
You can clone it into `~/lifecompanion2` for example.

### 4. Use it with make

To use this project, you should use the make command.  
Type `make` at the **project root path inside your WSL distro** to show all available commands.

## VSCode (optional)

We provide VSCode settings in this project.

If you want to use it as your IDE, you need the **WSL plugin** to open the project inside your WSL distro.

- [VS Code WSL plugin marketplace](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)

Then you can install recommended plugins (provided by `.vscode/extentions.json`).  
To find these plugins search `@recommended` inside the plugins panel.
