async function testWebhook() {
  const payload = {
    phone: "5511951366825",
    text: { message: "Iae? Local test" },
    isGroup: false
  };

  const res = await fetch("http://localhost:3000/api/webhooks/whatsapp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Client-Token": process.env.ZAPI_CLIENT_TOKEN || ""
    },
    body: JSON.stringify(payload)
  });

  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}
testWebhook();
