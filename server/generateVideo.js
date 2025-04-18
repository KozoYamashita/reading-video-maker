const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function generateUniqueFilename(prefix, ext = '.mp4') {
  const timestamp = Date.now();
  return `${prefix}_${timestamp}${ext}`;
}

function generateVideo(imagePath, audioPath, callback) {
  // 出力フォルダの準備
  const outputDir = path.join(__dirname, '../outputs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFileName = generateUniqueFilename('output');
  const outputPath = path.join(outputDir, outputFileName);

  const command = `ffmpeg -loop 1 -i "${imagePath}" -i "${audioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${outputPath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('ffmpeg error:', error);
      console.error(stderr);
      callback(error, null);
    } else {
      console.log('Video generated at:', outputPath);
      callback(null, outputPath);
    }
  });
}

module.exports = generateVideo;
