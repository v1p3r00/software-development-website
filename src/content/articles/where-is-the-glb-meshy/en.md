---
title: How to extract Meshy files and convert them to GLB
description: A DevTools investigation into how a web app ships 3D models: no .glb request, a proprietary MESHY.AI container, and a WebAssembly decoder in the browser.
date: 2026-09-30
tags: [devtools, webassembly, 3d, reverse engineering]
---
# How to extract Meshy files and convert them to GLB

This guide shows how to take a Meshy AI model downloaded as a `model.meshy` file and convert it into a standard `model.glb` file.

The guide includes commands for both **macOS** and **Windows**.

---

# 1. Find `model.meshy` in the browser

Open the Meshy model page in Chrome.

Open Developer Tools:

**macOS**

```text
⌘ + ⌥ + I
```

**Windows**

```text
Ctrl + Shift + I
```

Open:

```text
Network
```

Enable:

```text
Preserve log
```

Reload the page:

**macOS**

```text
⌘ + R
```

**Windows**

```text
Ctrl + R
```

In the Network search box, search for:

```text
meshy
```

or:

```text
model
```

Find the binary request associated with the model.

Save the file as:

```text
model.meshy
```

---

# 2. Inspect the file

Open Terminal / PowerShell and navigate to the directory where the file was saved.

## macOS

If the file is in Downloads:

```bash
cd ~/Downloads
```

Check the file:

```bash
ls -lh model.meshy
```

Then:

```bash
file model.meshy
```

It may be reported simply as:

```text
model.meshy: data
```

Inspect the first 64 bytes:

```bash
xxd -l 64 model.meshy
```

The file should start with:

```text
MESHY.AI
```

---

## Windows

Open PowerShell:

```powershell
cd "$HOME\Downloads"
```

Check the file:

```powershell
Get-Item .\model.meshy
```

Inspect the first 64 bytes:

```powershell
Format-Hex .\model.meshy -Count 64
```

The file should start with:

```text
MESHY.AI
```

---

# 3. Install the required tools

The conversion requires:

- Node.js
- `uv`
- the Meshy loader
- `meshy-glb-downloader`

## macOS

Check Node.js:

```bash
node --version
```

Check `uv`:

```bash
uv --version
```

If `uv` is not installed and you use Homebrew:

```bash
brew install uv
```

If Node.js is not installed:

```bash
brew install node
```

Verify:

```bash
node --version
uv --version
```

---

## Windows

Check Node.js:

```powershell
node --version
```

Check `uv`:

```powershell
uv --version
```

If `uv` is not installed, run in PowerShell:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Restart PowerShell and run:

```powershell
uv --version
```

If Node.js is not installed, install the Node.js LTS release and then verify:

```powershell
node --version
```

---

# 4. Download the Meshy loader

The loader required to process the `.meshy` format can be downloaded and cached with the following command.

## macOS

```bash
uvx --from git+https://github.com/Shuvam-Banerji-Seal/meshy-glb-downloader \
python -c "from meshy_glb.core import ensure_loader; print(ensure_loader())"
```

Example output:

```text
('/Users/mac/.cache/meshy-glb/mesh_loader.js',
 '/Users/mac/.cache/meshy-glb/mesh_loader.wasm')
```

Check the files:

```bash
ls -lh ~/.cache/meshy-glb/
```

---

## Windows

PowerShell:

```powershell
uvx --from git+https://github.com/Shuvam-Banerji-Seal/meshy-glb-downloader `
python -c "from meshy_glb.core import ensure_loader; print(ensure_loader())"
```

Example output:

```text
C:\Users\YourName\.cache\meshy-glb\mesh_loader.js
C:\Users\YourName\.cache\meshy-glb\mesh_loader.wasm
```

Check the files:

```powershell
Get-ChildItem "$HOME\.cache\meshy-glb"
```

---

# 5. Convert `.meshy` to `.glb`

The conversion uses the `decrypt_meshy()` function.

## macOS

Use the loader paths returned by `ensure_loader()`.

Example:

```bash
uvx --from git+https://github.com/Shuvam-Banerji-Seal/meshy-glb-downloader \
python -c "from meshy_glb.core import decrypt_meshy; decrypt_meshy('model.meshy', 'model.glb', '/Users/mac/.cache/meshy-glb/mesh_loader.js', '/Users/mac/.cache/meshy-glb/mesh_loader.wasm', 'node'); print('DONE: model.glb')"
```

Successful output:

```text
DONE: model.glb
```

---

## Windows

In PowerShell, replace the paths with the paths returned by your `ensure_loader()` command.

For example:

```powershell
uvx --from git+https://github.com/Shuvam-Banerji-Seal/meshy-glb-downloader `
python -c "from meshy_glb.core import decrypt_meshy; decrypt_meshy('model.meshy', 'model.glb', 'C:/Users/YourName/.cache/meshy-glb/mesh_loader.js', 'C:/Users/YourName/.cache/meshy-glb/mesh_loader.wasm', 'node'); print('DONE: model.glb')"
```

Successful output:

```text
DONE: model.glb
```

Using `/` instead of `\` in the Windows paths avoids escaping issues inside the Python command.

---

# 6. Verify the generated GLB

## macOS

```bash
ls -lh model.glb
```

Then:

```bash
file model.glb
```

A successful conversion should produce something similar to:

```text
model.glb: glTF binary model, version 2, length 19825136 bytes
```

---

## Windows

```powershell
Get-Item .\model.glb
```

To inspect the first four bytes:

```powershell
Format-Hex .\model.glb -Count 4
```

A GLB file starts with:

```text
67 6C 54 46
```

which is ASCII:

```text
glTF
```

---

# 7. Open the model in Blender

Open Blender and select:

```text
File
 → Import
 → glTF 2.0 (.glb/.gltf)
```

Select:

```text
model.glb
```

The model can now be used as a standard glTF 2.0 Binary asset.

---

# 8. Complete process – macOS

```bash
cd ~/Downloads
```

```bash
file model.meshy
```

```bash
xxd -l 64 model.meshy
```

```bash
uvx --from git+https://github.com/Shuvam-Banerji-Seal/meshy-glb-downloader \
python -c "from meshy_glb.core import ensure_loader; print(ensure_loader())"
```

Then use the loader paths returned by the previous command:

```bash
uvx --from git+https://github.com/Shuvam-Banerji-Seal/meshy-glb-downloader \
python -c "from meshy_glb.core import decrypt_meshy; decrypt_meshy('model.meshy', 'model.glb', '/Users/mac/.cache/meshy-glb/mesh_loader.js', '/Users/mac/.cache/meshy-glb/mesh_loader.wasm', 'node'); print('DONE: model.glb')"
```

Verify:

```bash
file model.glb
```

---

# 9. Complete process – Windows

PowerShell:

```powershell
cd "$HOME\Downloads"
```

```powershell
Get-Item .\model.meshy
```

```powershell
Format-Hex .\model.meshy -Count 64
```

Download the loader:

```powershell
uvx --from git+https://github.com/Shuvam-Banerji-Seal/meshy-glb-downloader `
python -c "from meshy_glb.core import ensure_loader; print(ensure_loader())"
```

Then use the loader paths returned by the previous command:

```powershell
uvx --from git+https://github.com/Shuvam-Banerji-Seal/meshy-glb-downloader `
python -c "from meshy_glb.core import decrypt_meshy; decrypt_meshy('model.meshy', 'model.glb', 'C:/Users/YourName/.cache/meshy-glb/mesh_loader.js', 'C:/Users/YourName/.cache/meshy-glb/mesh_loader.wasm', 'node'); print('DONE: model.glb')"
```

Verify:

```powershell
Get-Item .\model.glb
```

---

# 10. In short

```text
Meshy AI
   ↓
Chrome → Developer Tools
   ↓
Network
   ↓
model.meshy
   ↓
Save model.meshy
   ↓
mesh_loader.js
mesh_loader.wasm
   ↓
decrypt_meshy()
   ↓
model.glb
   ↓
Blender
```

Final result:

```text
model.meshy
     ↓
   decode
     ↓
model.glb
```

The resulting `model.glb` is a standard **glTF 2.0 Binary** file and can be opened by Blender and other GLB/glTF-compatible applications.
