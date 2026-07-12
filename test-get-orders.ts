import { getOrdersByUserIdDB } from "./src/lib/db";
import { database } from "./src/lib/firebase";

async function run() {
  try {
    const orders = await getOrdersByUserIdDB("test-uid");
    console.log("Orders:", orders);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
