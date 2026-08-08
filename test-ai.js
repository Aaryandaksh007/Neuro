import { chat } from "./src/lib/ai.js";

async function main() {
  try {
    const res = await chat([{ role: "user", content: "Hello" }], { system: "You are a helpful assistant." });
    console.log("SUCCESS:", res);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
main();
