document.getElementById('shortenBtn').addEventListener('click', async function() {
  const url = document.getElementById('urlInput').value.trim();

  if (!url) {
    alert("Please enter a URL");
    return;
  }

  try {
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (data.error) {
      document.getElementById('result').innerText = data.error;
    } else {
      document.getElementById('result').innerHTML =
        `Short Link: <a target="_blank" href="/${data.code}">${window.location.origin}/${data.code}</a>`;
    }
  } catch (err) {
    document.getElementById('result').innerText = "Error connecting to server";
  }
});