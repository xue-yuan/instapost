import { app, BrowserWindow, dialog, ipcMain, nativeTheme } from "electron";
import { IgApiClient } from "instagram-private-api";
import path from "path";

import config from "./config.js";
import * as event from "./event.js";
import * as utils from "./utils.js";

const ig = new IgApiClient();

let mainWin = null;

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      preload: path.join(path.resolve(), "preload.js"),
      contextIsolation: true,
      enableRemoteModule: true,
      nodeIntegration: false,
    },
    resizable: false,
  });

  mainWin.loadFile("dist/index.html");
  mainWin.webContents.openDevTools();

  nativeTheme.on("updated", () => {
    mainWin.webContents.send(
      "theme-updated",
      nativeTheme.shouldUseDarkColors ? "dark" : "light",
    );
  });

  mainWin.webContents.on("did-finish-load", () => {
    mainWin.webContents.send(
      "theme-updated",
      nativeTheme.shouldUseDarkColors ? "dark" : "light",
    );
  });
}

app.whenReady().then(async () => {
  await utils.createFolder(config.tmpFolder);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", async () => {
  await utils.removeFolder(config.tmpFolder);
  app.quit();
});

ipcMain.handle(
  "process-media",
  async (_, imagePath, audioPath, audioStart, audioEnd) => {
    return event.processVideo(imagePath, audioPath, audioStart, audioEnd);
  },
);

ipcMain.handle("video:save", async (_, sourcePath) => {
  return dialog
    .showSaveDialog(mainWin, {
      defaultPath: config.defaultSavedPath,
    })
    .then((res) => {
      if (!res.canceled) {
        return utils.copyFile(sourcePath, res.filePath);
      }
    });
});

ipcMain.handle("video:upload", async (_, videoPath, coverPath, caption) => {
  async function login() {
    // TODO: remove hardcoding
    ig.state.generateDevice("username");
    await ig.account.login("username", "password");
  }

  return (async () => {
    await login();

    const video = await utils.readFile(videoPath);
    const cover = await utils.readFile(coverPath);

    const result = await ig.publish.video({
      video: video,
      coverImage: cover,
      caption,
    });

    return result.status;
  })();
});

ipcMain.handle("user:login", async (_) => {});
