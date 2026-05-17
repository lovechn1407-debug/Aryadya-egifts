const play = require('play-dl');

async function test() {
  try {
    const stream = await play.stream('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    console.log(stream.url);
  } catch(e) {
    console.error(e);
  }
}
test();
