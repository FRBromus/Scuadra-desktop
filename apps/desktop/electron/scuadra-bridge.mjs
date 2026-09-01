import path from "node:path";
import fs from "node:fs/promises";

const MAX_READ_BYTES = 20 * 1024 * 1024; // 20 MB

function normalizeForCompare(value, platform) {
  const resolved = path.resolve(value);
  return platform === "win32" ? resolved.toLowerCase() : resolved;
}

/**
 * A path is allowed only when it equals an approved root or lives inside one.
 * Roots are added exclusively through the native picker dialogs, so the web UI
 * can never reach a folder the user did not explicitly select.
 */
export function isPathAllowed(target, allowedRoots, platform = process.platform) {
  const normalizedTarget = normalizeForCompare(target, platform);
  for (const root of allowedRoots) {
    const normalizedRoot = normalizeForCompare(root, platform);
    if (normalizedTarget === normalizedRoot) return true;
    if (normalizedTarget.startsWith(normalizedRoot + path.sep)) return true;
  }
  return false;
}

export function registerScuadraIpc({ ipcMain, dialog, getMainWindow }) {
  const allowedRoots = new Set();

  const guard = (target) => {
    if (typeof target !== "string" || target.trim() === "") {
      return { ok: false, error: "empty path" };
    }
    if (!isPathAllowed(target, allowedRoots)) {
      return { ok: false, error: "path outside the folders approved by the user" };
    }
    return null;
  };

  ipcMain.handle("scuadra:pick-folder", async () => {
    const win = getMainWindow();
    const result = await dialog.showOpenDialog(win, {
      properties: ["openDirectory"],
      title: "Elegir carpeta para Scuadra",
    });
    if (result.canceled || result.filePaths.length === 0) {
      return { ok: true, path: null };
    }
    const folder = result.filePaths[0];
    allowedRoots.add(folder);
    return { ok: true, path: folder };
  });

  ipcMain.handle("scuadra:pick-file", async () => {
    const win = getMainWindow();
    const result = await dialog.showOpenDialog(win, {
      properties: ["openFile"],
      title: "Elegir archivo para Scuadra",
    });
    if (result.canceled || result.filePaths.length === 0) {
      return { ok: true, path: null };
    }
    const file = result.filePaths[0];
    allowedRoots.add(file);
    return { ok: true, path: file };
  });

  ipcMain.handle("scuadra:list-folder", async (_event, folderPath) => {
    const blocked = guard(folderPath);
    if (blocked) return blocked;
    try {
      const entries = await fs.readdir(folderPath, { withFileTypes: true });
      const items = [];
      for (const entry of entries) {
        const item = { name: entry.name, type: entry.isDirectory() ? "folder" : "file" };
        if (!entry.isDirectory()) {
          try {
            item.size = (await fs.stat(path.join(folderPath, entry.name))).size;
          } catch {
            // size is informative only
          }
        }
        items.push(item);
      }
      return { ok: true, items };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle("scuadra:read-file", async (_event, filePath, options) => {
    const blocked = guard(filePath);
    if (blocked) return blocked;
    try {
      const stats = await fs.stat(filePath);
      if (stats.size > MAX_READ_BYTES) {
        return { ok: false, error: `file exceeds the ${MAX_READ_BYTES / (1024 * 1024)} MB read limit` };
      }
      const encoding = options?.encoding === "base64" ? "base64" : "utf8";
      const content = await fs.readFile(filePath, encoding);
      return { ok: true, content, encoding, size: stats.size };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle("scuadra:write-file", async (_event, filePath, content, options) => {
    const blocked = guard(filePath);
    if (blocked) return blocked;
    if (typeof content !== "string") {
      return { ok: false, error: "content must be a string" };
    }
    try {
      const encoding = options?.encoding === "base64" ? "base64" : "utf8";
      await fs.writeFile(filePath, content, encoding);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
}
