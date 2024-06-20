const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const ffmpeg = require("fluent-ffmpeg");

const fs = require("fs");
const path = require("path");

const utils = require("./utils");
const DATA_PATH = "/tmp/instapost";

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: true,
      nodeIntegration: false,
    },
    resizable: false,
  });

  win.loadFile("dist/index.html");
  // win.webContents.openDevTools();

  ipcMain.handle("save-file", async (event, sourcePath) => {
    return dialog
      .showSaveDialog(win, {
        defaultPath: "~/Desktop/instapost.mp4",
      })
      .then((result) => {
        if (!result.canceled) {
          const destinationPath = result.filePath;
          fs.copyFile(sourcePath, destinationPath, (err) => {
            if (!err) {
              return destinationPath;
            }
          });
        }
      })
      .catch((err) => {
        console.error("error:", err);
      });
  });

  fs.mkdir(DATA_PATH, { recursive: true }, (err) => {
    if (err) {
      console.error("error:", err);
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.handle(
  "media-process",
  async (event, imagePath, audioPath, audioStart, audioEnd, oldFile) => {
    const outputAudioPath = path.join(`${DATA_PATH}/output.mp3`);
    const outputVideoPath = path.join(
      `${DATA_PATH}/${utils.generateRandomString(10)}.mp4`,
    );

    if (oldFile) {
      utils.removeFile(oldFile);
    }

    return new Promise((resolve, reject) => {
      ffmpeg(audioPath)
        .setStartTime(audioStart)
        .setDuration(audioEnd - audioStart)
        .output(outputAudioPath)
        .on("end", () => {
          ffmpeg()
            .input(imagePath)
            .loop(audioEnd - audioStart)
            .input(outputAudioPath)
            .videoCodec("libx264")
            .outputOptions(["-pix_fmt yuv420p"])
            .output(outputVideoPath)
            .on("end", () => {
              utils.removeFile(outputAudioPath);
              resolve(outputVideoPath);
            })
            .on("error", (err) => {
              utils.removeFile(outputAudioPath);
              reject(err.message);
            })
            .run();
        })
        .on("error", () => {
          reject(err.message);
        })
        .run();
    });
  },
);

ipcMain.handle("remove-file", async (event, path) => {
  utils.removeFile(path);
});
