async function test() {
  try {
    const res = await fetch("https://api.cobalt.tools/", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: "https://www.youtube.com/watch?v=QQEu7GTa6zk",
        isAudioOnly: true
      })
    });
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.log(e.message);
  }
}
test();
