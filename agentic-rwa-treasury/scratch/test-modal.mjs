async function testUrl(url) {
  console.log(`Testing URL (Bearer): ${url}`);
  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": "Bearer wk-oxVuPHu98L9BH0240NJl43.ws-QzGUa6qUwak1zMhZ82SqHd"
      }
    });
    console.log(`  Response Status: ${response.status}`);
    const text = await response.text();
    console.log(`  Response Text: ${text.slice(0, 200)}`);
  } catch (err) {
    console.error(`  Error: ${err.message}`);
  }

  console.log(`Testing URL (Modal headers): ${url}`);
  try {
    const response = await fetch(url, {
      headers: {
        "Modal-Key": "wk-oxVuPHu98L9BH0240NJl43",
        "Modal-Secret": "ws-QzGUa6qUwak1zMhZ82SqHd"
      }
    });
    console.log(`  Response Status: ${response.status}`);
    const text = await response.text();
    console.log(`  Response Text: ${text.slice(0, 200)}`);
  } catch (err) {
    console.error(`  Error: ${err.message}`);
  }
}

async function main() {
  const subdomains = [
    "https://gautamvivekgv--hack.modal.run/v1/models",
    "https://gautamvivekgv--hack-server.modal.run/v1/models",
    "https://gautamvivekgv--agentic-rwa-deepseek-v4.modal.run/v1/models",
    "https://gautamvivekgv--agentic-rwa-deepseek-v4-server.modal.run/v1/models"
  ];
  for (const url of subdomains) {
    await testUrl(url);
  }
}

main();
