# Notice: Claude Code on Termux — Use proot-distro for Best Results

## The Problem

Running Claude Code directly in Termux's native environment causes frequent errors:
- Missing system libraries and headers
- Permission issues with `/proc`, `/sys`, and other system paths
- Node.js and npm compatibility issues
- Git operations failing due to sandbox restrictions
- Tool execution failures due to missing GNU coreutils

## The Solution

Run Claude Code inside a **proot-distro** Linux distribution (Ubuntu recommended).

### Quick Setup

```bash
# In Termux:
pkg update && pkg install proot-distro

# Install Ubuntu:
proot-distro install ubuntu

# Enter Ubuntu:
proot-distro login ubuntu

# Inside Ubuntu, install dependencies:
apt update && apt install -y git nodejs npm curl

# Install Claude Code:
npm install -g @anthropic-ai/claude-code

# Run it:
claude
```

### Why This Works

proot-distro provides:
- Full GNU/Linux filesystem hierarchy (`/usr`, `/etc`, `/lib`, etc.)
- Standard package manager (apt) with access to all Ubuntu packages
- Proper process isolation without root or kernel access
- Compatible C library and system headers for native modules
- Git, Node.js, and npm work as expected without Termux-specific patches

### Tested Environment

- **Device:** Motorola (Android)
- **Terminal:** Termux
- **Distro:** Ubuntu via proot-distro
- **Claude Code:** Works reliably for file operations, git, GitHub CLI, and multi-file editing
- **Tested by:** Turbo-the-tech-dev (2026-02-20)

### Known Limitations

- Slower than native Termux due to proot syscall translation
- No hardware access (USB, Bluetooth) from within proot
- Large git operations can be slow on phone storage
- Screen real estate is limited — consider using a Bluetooth keyboard

### Filing This as an Issue

This should be documented in the Claude Code README or troubleshooting guide.
Termux users hitting errors should be directed to proot-distro as the recommended path.

**Suggested location:** https://github.com/anthropics/claude-code/issues
**Tags:** `documentation`, `termux`, `android`, `proot-distro`
