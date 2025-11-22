async function createLink() {
  const url = document.getElementById('urlInput').value;
  const code = document.getElementById('codeInput').value;

  if (!url) {
    alert('Please enter a URL');
    return;
  }

  const res = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, code })
  });

  const data = await res.json();

  if (data.error) {
    document.getElementById('result').innerText = data.error;
  } else {
    document.getElementById('result').innerHTML = `Short link created: <a href="${window.location.origin}/${data.code}" target="_blank">${window.location.origin}/${data.code}</a>`;
    loadLinks();
  }
}

async function loadLinks() {
  const res = await fetch('/api/links');
  const links = await res.json();

  const tbody = document.getElementById('linkTable');
  tbody.innerHTML = '';

  links.forEach(l => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${l.code}</td>
      <td>${l.url}</td>
      <td>${l.clicks}</td>
      <td>${l.lastClicked || '-'}</td>
      <td><button onclick="deleteLink('${l.code}')">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function deleteLink(code) {
  await fetch(`/api/links/${code}`, { method: 'DELETE' });
  loadLinks();
}

// Load table on page load
window.onload = loadLinks;