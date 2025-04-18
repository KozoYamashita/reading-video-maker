// server/index.js

const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({ dest: "uploads/" });

app.post("/generate-video", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "audio", maxCount: 1 }
]), (req, res) => {
  const imagePath = req.files.image[0].path;
  const audioPath = req.files.audio[0].path;
  const outputPath = `outputs/output_${Date.now()}.mp4`;

  // ffmpegコマンド
  const ffmpegCmd = `ffmpeg -loop 1 -i ${imagePath} -i ${audioPath} -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest ${outputPath}`;

  exec(ffmpegCmd, (err, stdout, stderr) => {
    if (err) {
      console.error("ffmpeg error:", stderr);
      res.status(500).send("動画生成に失敗したで");
      return;
    }

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", "attachment; filename=reading-video.mp4");

    const readStream = fs.createReadStream(outputPath);
    readStream.pipe(res);

    // 念のため終了後にファイル削除（非同期で）
    readStream.on("close", () => {
      fs.unlink(imagePath, () => {});
      fs.unlink(audioPath, () => {});
      fs.unlink(outputPath, () => {});
    });
  });
});

app.get("/", (req, res) => {
  res.send("Reading Video Maker API is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
