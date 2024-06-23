import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";

import ffmpeg from "fluent-ffmpeg";
import imageType from "image-type";

export function generateRandomString(length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

export async function convertToJpg(imagePath, baseFolder) {
  const data = await readFile(imagePath);
  const type = await imageType(data);

  if (type && type.ext === "image/jpeg") {
    return imagePath;
  }

  const jpgPath = path.join(
    baseFolder,
    `${path.basename(imagePath, path.extname(imagePath))}.jpg`,
  );

  await new Promise((resolve, reject) => {
    ffmpeg(imagePath)
      .output(jpgPath)
      .on("end", () => resolve())
      .on("error", (err) => {
        throw err;
      })
      .run();
  });

  return jpgPath;
}

export async function createFolder(folder) {
  return fs.mkdir(folder, { recursive: true });
}

export async function removeFolder(folder) {
  return fs.rmdir(folder, { recursive: true, force: true });
}

export async function copyFile(source, destination) {
  return fs.copyFile(source, destination).then(() => destination);
}

export async function readFile(file) {
  return fs.readFile(file);
}

export async function removeFile(file) {
  return fs.unlink(file).catch((error) => {
    if (error.code === "ENOENT") {
      return;
    }
    throw error;
  });
}
