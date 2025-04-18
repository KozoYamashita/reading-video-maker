const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());

ffmpeg.setFfmpegPath(ffmpegPath);

const upload = multer({ dest: "uploads/" });

app.post("/generate-video", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "audio", maxCount: 1 }
]), async (req, res) => {
  try {
    const imagePath = req.files.image[0].path;
    const audioPath = req.files.audio[0].path;

    const outputDir = path.join(__dirname, "outputs");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const outputPath = path.join(outputDir, `output_${Date.now()}.mp4`);

    ffmpeg()
      .addInput(imagePath)
      .loop(2) // 🔽 短くする（2秒）
      .addInput(audioPath)
      .outputOptions([
        "-preset ultrafast", // 🔽 CPU負荷軽減
        "-c:v libx264",
        "-c:a aac",
        "-strict experimental",
        "-shortest"
      ])
      .on("end", () => {
        res.sendFile(outputPath);
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        res.status(500).send("動画生成に失敗しました。");
      })
      .save(outputPath);

  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).send("内部エラー");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
