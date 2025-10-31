import ytdl from "ytdl-core";

export default async function handler(req, res) {
  const { key, link } = req.query;

  // ✅ Allow multiple valid API keys
  const VALID_KEYS = ["DLIT9QZ7W1R3X8B6Y5P0", "DLIT154920"];

  // ✅ Check key
  if (!VALID_KEYS.includes(key)) {
    return res.status(403).json({
      success: false,
      error: "Invalid API key",
      buildBy: "@ITACHIxHUNTER15"
    });
  }

  // ✅ Check YouTube link
  if (!link || !ytdl.validateURL(link)) {
    return res.status(400).json({
      success: false,
      error: "Invalid or missing YouTube link",
      buildBy: "@ITACHIxHUNTER15"
    });
  }

  try {
    // 🧠 Get info
    const info = await ytdl.getInfo(link);
    const video = info.videoDetails;

    // 🧩 Prepare clean JSON output
    const data = {
      success: true,
      title: video.title,
      description: video.description,
      duration: video.lengthSeconds + " seconds",
      views: video.viewCount,
      uploadDate: video.uploadDate,
      category: video.category,
      keywords: video.keywords,
      video: {
        id: video.videoId,
        url: `https://www.youtube.com/watch?v=${video.videoId}`,
        thumbnail: video.thumbnails?.at(-1)?.url || null
      },
      channel: {
        name: video.author.name,
        url: video.author.channel_url,
        thumbnail: video.author.thumbnails?.[0]?.url || null
      },
      formats: info.formats
        .filter(f => f.mimeType && f.mimeType.includes("audio/"))
        .map(f => ({
          mime: f.mimeType,
          bitrate: f.audioBitrate,
          sizeEstimate: f.contentLength
            ? (parseInt(f.contentLength) / (1024 * 1024)).toFixed(2) + " MB"
            : null,
          url: f.url
        })),
      buildBy: "@ITACHIxHUNTER15"
    };

    // ✅ Send response
    return res.status(200).json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch video info",
      details: err.message,
      buildBy: "@ITACHIxHUNTER15"
    });
  }
}
