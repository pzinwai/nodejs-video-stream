const express = require("express");
const app = express();
const fs = require("fs");

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/stream", function (req, res) {
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires range header.");
  }
  
  let videoId = "1";
  let videoPath = "";
  let videoSize = "";
  
  if (req.query.v) {
    videoId = req.query.v;
  }

  switch(videoId) {
    case "1":
      videoPath = "video_source/bigbuck.mp4";
      videoSize = fs.statSync("video_source/bigbuck.mp4").size;
      break;
    case "2":
      videoPath = "video_source/earth.mp4";
      videoSize = fs.statSync("video_source/earth.mp4").size;
      break;
    default:
      videoPath = "video_source/bigbuck.mp4";
      videoSize = fs.statSync("video_source/bigbuck.mp4").size;
  }

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

app.listen(8080, function () {
  console.log("Listening on port 8080!");
});