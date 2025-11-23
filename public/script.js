async function fetchLinks() {
  const response = await fetch('/api/links');
  const links = await response.json();

  const tbody = document.querySelector('#linksTable tbody');
  tbody.innerHTML = '';

  for (const code in links) {
    const link = links[code];
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${code}</td>
      <td><a href="/${code}" target="_blank">${link.url}</a></td>
      <td>${link.clicks}</td>
      <td>${link.lastClicked || '-'}</td>
      <td><button onclick="deleteLink('${code}')">Delete</button></td>
    `;
    tbody.appendChild(tr);
  }
}

async function createLink() {
  const url = document.getElementById('urlInput').value;
  const code = document.getElementById('customCode').value;

  if (!url) return alert('Please enter a URL');

  const response = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, code })
  });

  const data = await response.json();
  if (data.error) alert(data.error);

  fetchLinks();
  document.getElementById('urlInput').value = '';
  document.getElementById('customCode').value = '';
}

async function deleteLink(code) {
  await fetch(`/api/links/${code}`, { method: 'DELETE' });
  fetchLinks();
}

// Initial load
fetchLinks();