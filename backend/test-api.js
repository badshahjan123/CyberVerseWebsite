async function testRoomsAPI() {
  try {
    console.log("🔍 Testing /api/rooms endpoint...\n");

    const response = await fetch("http://localhost:5000/api/rooms");
    const data = await response.json();

    console.log("Status:", response.status);
    console.log("\nAPI Response:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ API Error:", error.message);
  }

  process.exit(0);
}

testRoomsAPI();
