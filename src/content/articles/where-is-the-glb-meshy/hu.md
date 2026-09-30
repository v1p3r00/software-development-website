---
title: Meshy fileok kinyerése és glb-vé alakítása
description: DevTools-vizsgálat arról, hogyan szállít egy webalkalmazás 3D-modelleket: nincs .glb kérés, csak egy saját MESHY.AI konténer és egy WebAssembly-dekóder.
date: 2026-09-30
tags: [devtools, webassembly, 3d, visszafejtés]
---

# Meshy fileok kinyerése és glb-vé alakítása

Ez az útmutató bemutatja, hogyan lehet egy Meshy AI modellből letöltött `model.meshy` fájlt szabványos `model.glb` fájllá alakítani.

Az útmutató külön tartalmazza a **macOS** és **Windows** lépéseket.

---

# 1. A `model.meshy` megtalálása a böngészőben

Nyisd meg a Meshy modell oldalát Chrome-ban.

Nyisd meg a Developer Tools-t:

**macOS**

```text
⌘ + ⌥ + I
```

**Windows**

```text
Ctrl + Shift + I
```

Válaszd a:

```text
Network
```

panelt.

Kapcsold be:

```text
Preserve log
```

Ezután töltsd újra az oldalt:

**macOS**

```text
⌘ + R
```

**Windows**

```text
Ctrl + R
```

A Network keresőjében keress rá például:

```text
meshy
```

vagy:

```text
model
```

Keresd meg a modellhez tartozó bináris requestet.

Mentsd el a fájlt:

```text
model.meshy
```

---

# 2. A fájl ellenőrzése

Nyisd meg a Terminalt / PowerShellt, majd lépj abba a mappába, ahová a fájlt mentetted.

## macOS

Ha a Downloads mappába mentetted:

```bash
cd ~/Downloads
```

Ellenőrzés:

```bash
ls -lh model.meshy
```

Majd:

```bash
file model.meshy
```

A fájl például:

```text
model.meshy: data
```

A fejléc ellenőrzése:

```bash
xxd -l 64 model.meshy
```

A fájl elején várhatóan megtalálható:

```text
MESHY.AI
```

## Windows

PowerShellben:

```powershell
cd "$HOME\Downloads"
```

Ellenőrzés:

```powershell
Get-Item .\model.meshy
```

A fájl első bájtjainak megtekintése:

```powershell
Format-Hex .\model.meshy -Count 64
```

A fejlécnek itt is a következővel kell kezdődnie:

```text
MESHY.AI
```

---

# 3. Szükséges környezet

A konverzióhoz szükséges:

- Node.js
- `uv`
- a Meshy loader
- `meshy-glb-downloader`

## macOS

### Node.js ellenőrzése

```bash
node --version
```

### uv ellenőrzése

```bash
uv --version
```

Ha a Homebrew használatban van és az `uv` nincs telepítve:

```bash
brew install uv
```

Ha a Node.js nincs telepítve:

```bash
brew install node
```

Ellenőrzés:

```bash
node --version
uv --version
```

---

## Windows

### Node.js ellenőrzése

PowerShell:

```powershell
node --version
```

### uv ellenőrzése

```powershell
uv --version
```

Ha az `uv` nincs telepítve, PowerShellben:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Ezután indítsd újra a PowerShellt, majd:

```powershell
uv --version
```

Ha a Node.js nincs telepítve, telepítsd a Node.js LTS verzióját, majd ellenőrizd:

```powershell
node --version
```

---

# 4. A Meshy loader letöltése

A `.meshy` formátum kezeléséhez szükséges loader fájlokat az alábbi parancs tölti le és cache-eli.

## macOS

```bash
uvx --from git+https://github.com/Shuvam-Banerji-Seal/meshy-glb-downloader \
python -c "from meshy_glb.core import ensure_loader; print(ensure_loader())"
```

Például ezt kaphatod:

```text
('/Users/mac/.cache/meshy-glb/mesh_loader.js',
 '/Users/mac/.cache/meshy-glb/mesh_loader.wasm')
```

Ellenőrzés:

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

A kimenet például:

```text
C:\Users\YourName\.cache\meshy-glb\mesh_loader.js
C:\Users\YourName\.cache\meshy-glb\mesh_loader.wasm
```

Ellenőrzés:

```powershell
Get-ChildItem "$HOME\.cache\meshy-glb"
```

---

# 5. A `.meshy` → `.glb` konverzió

A konverzióhoz a `decrypt_meshy()` függvényt használjuk.

## macOS

A `ensure_loader()` által kiírt útvonalakat használd.

Példa:

```bash
uvx --from git+https://github.com/Shuvam-Banerji-Seal/meshy-glb-downloader \
python -c "from meshy_glb.core import decrypt_meshy; decrypt_meshy('model.meshy', 'model.glb', '/Users/mac/.cache/meshy-glb/mesh_loader.js', '/Users/mac/.cache/meshy-glb/mesh_loader.wasm', 'node'); print('DONE: model.glb')"
```

Sikeres futás:

```text
DONE: model.glb
```

---

## Windows

PowerShellben a saját Windows felhasználói útvonaladat kell használni.

Például:

```powershell
uvx --from git+https://github.com/Shuvam-Banerji-Seal/meshy-glb-downloader `
python -c "from meshy_glb.core import decrypt_meshy; decrypt_meshy('model.meshy', 'model.glb', 'C:\Users\YourName\.cache\meshy-glb\mesh_loader.js', 'C:\Users\YourName\.cache\meshy-glb\mesh_loader.wasm', 'node'); print('DONE: model.glb')"
```

**Fontos:** Python stringben a Windows `\` karakterek escape-elési problémát okozhatnak. Biztosabb megoldás `/` használata:

```powershell
uvx --from git+https://github.com/Shuvam-Banerji-Seal/meshy-glb-downloader `
python -c "from meshy_glb.core import decrypt_meshy; decrypt_meshy('model.meshy', 'model.glb', 'C:/Users/YourName/.cache/meshy-glb/mesh_loader.js', 'C:/Users/YourName/.cache/meshy-glb/mesh_loader.wasm', 'node'); print('DONE: model.glb')"
```

Sikeres futás:

```text
DONE: model.glb
```

---

# 6. A létrejött GLB ellenőrzése

## macOS

```bash
ls -lh model.glb
```

Majd:

```bash
file model.glb
```

Sikeres konverzió esetén például:

```text
model.glb: glTF binary model, version 2, length 19825136 bytes
```

---

## Windows

```powershell
Get-Item .\model.glb
```

Ha telepítve van a Git Bash vagy más Unix-kompatibilis környezet, használható:

```bash
file model.glb
```

PowerShellből egyszerűen ellenőrizhető a fájl mérete:

```powershell
(Get-Item .\model.glb).Length
```

A GLB fejlécének ellenőrzése:

```powershell
Format-Hex .\model.glb -Count 4
```

A GLB fájl első négy bájtja:

```text
67 6C 54 46
```

ami ASCII formában:

```text
glTF
```

---

# 7. A modell megnyitása Blenderben

Nyisd meg a Blender-t:

```text
File
 → Import
 → glTF 2.0 (.glb/.gltf)
```

Válaszd ki:

```text
model.glb
```

A Meshy modell ezután szabványos glTF 2.0 Binary formátumban használható.

---

# 8. Teljes folyamat – macOS

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

Ezután a kapott loader útvonalakkal:

```bash
uvx --from git+https://github.com/Shuvam-Banerji-Seal/meshy-glb-downloader \
python -c "from meshy_glb.core import decrypt_meshy; decrypt_meshy('model.meshy', 'model.glb', '/Users/mac/.cache/meshy-glb/mesh_loader.js', '/Users/mac/.cache/meshy-glb/mesh_loader.wasm', 'node'); print('DONE: model.glb')"
```

Ellenőrzés:

```bash
file model.glb
```

---

# 9. Teljes folyamat – Windows

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

Loader:

```powershell
uvx --from git+https://github.com/Shuvam-Banerji-Seal/meshy-glb-downloader `
python -c "from meshy_glb.core import ensure_loader; print(ensure_loader())"
```

Ezután a kapott Windows útvonalakkal:

```powershell
uvx --from git+https://github.com/Shuvam-Banerji-Seal/meshy-glb-downloader `
python -c "from meshy_glb.core import decrypt_meshy; decrypt_meshy('model.meshy', 'model.glb', 'C:/Users/YourName/.cache/meshy-glb/mesh_loader.js', 'C:/Users/YourName/.cache/meshy-glb/mesh_loader.wasm', 'node'); print('DONE: model.glb')"
```

Ellenőrzés:

```powershell
Get-Item .\model.glb
```

---

# 10. Röviden

```text
Meshy AI
   ↓
Chrome → Developer Tools
   ↓
Network
   ↓
model.meshy
   ↓
model.meshy mentése
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

A végső eredmény:

```text
model.meshy
     ↓
  decode
     ↓
model.glb
```

A `model.glb` szabványos **glTF 2.0 Binary** fájl, ezért Blenderben és más glTF/GLB-kompatibilis 3D alkalmazásokban használható.
