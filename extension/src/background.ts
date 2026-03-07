chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "QUERY") {

    // console.log("Background worker payload:", message.payload)
    fetch("https://terpcompare-production.up.railway.app/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.payload),
    })
      .then((res) => res.json())
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));

    return true;
  }
});