// Shorten URL
async function shorten() {
  const url = document.getElementById('urlInput').value;
  const code = document.getElementById('customCode').value;

  if (!url) {
    alert("Please enter a URL");
    return;
  }

  const response = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: url, code: code })
  });

  const data = await response.json();

  if (data.error) {
    document.getElementById('result').innerText = data.error;
  } else {
    document.getElementById('result').innerHTML =
      `Short Link: <a target="_blank" href="/${data.code}">${window.location.origin}/${data.code}</a>`;
    loadLinks();
  }
}

// Load all links
async function loadLinks() {
  const response = await fetch('/api/links');
  const links = await response.json();

  const tbody = document.getElementById('linksBody');
  tbody.innerHTML = '';

  links.forEach(link => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${link.code}</td>
      <td>${link.url}</td>
      <td>${link.clicks}</td>
      <td>${link.lastClicked || '-'}</td>
      <td><button onclick="deleteLink('${link.code}')">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Delete a link
async function deleteLink(code) {
  const response = await fetch(`/api/links/${code}`, { method: 'DELETE' });
  if (response.ok) loadLinks();
}

// Load links when page loads
window.onload = loadLinks;