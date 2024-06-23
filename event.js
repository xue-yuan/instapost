import ffmpeg from "fluent-ffmpeg";

import path from "path";

import config from "./config.js";
import * as utils from "./utils.js";

export async function processVideo(imagePath, audioPath, audioStart, audioEnd) {
  const tmpId = utils.generateRandomString(10);
  const tmpFolder = `${config.tmpFolder}/${tmpId}`;

  await utils.createFolder(tmpFolder);

  const jpgImagePath = await utils.convertToJpg(imagePath, tmpFolder);
  const outputAudioPath = path.join(`${tmpFolder}/output.mp3`);
  const outputVideoPath = path.join(`${tmpFolder}/output.mp4`);

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
            resolve([outputVideoPath, jpgImagePath]);
          })
          .on("error", (err) => {
            reject(err.message);
          })
          .run();
      })
      .on("error", (err) => {
        reject(err.message);
      })
      .run();
  });
}
