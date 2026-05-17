async function test() {
  try {
    const res = await fetch("https://youtube.michaelbelgium.me/api/converter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
      body: "url=https://www.youtube.com/watch?v=QQEu7GTa6zk"
    });
    const text = await res.text();
    console.log(text);
  } catch (e) {
    console.log(e.message);
  }
}
test();
