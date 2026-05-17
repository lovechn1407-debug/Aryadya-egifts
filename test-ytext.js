const ytext = require('youtube-ext');

async function test() {
  try {
    const videoInfo = await ytext.videoInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    const audioFormats = videoInfo.formats.filter(f => f.mimeType.startsWith('audio/'));
    console.log(audioFormats[0].url);
  } catch(e) {
    console.error(e);
  }
}
test();
