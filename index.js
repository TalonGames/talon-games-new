const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const root = __dirname;
const port = process.env.PORT || 3000;

function safePathFromRequest(requestPath) {
  const normalized = path.normalize(requestPath).replace(/^\.+/, '');
  const resolved = path.join(root, normalized);
  return resolved.startsWith(root) ? resolved : null;
}

function sendExistingFile(req, res) {
  const requestPath = decodeURIComponent(req.path);
  let filePath = safePathFromRequest(requestPath);

  if (!filePath) {
    res.status(400).send('Bad request');
    return;
  }

  if (requestPath === '/' || requestPath === '') {
    res.sendFile(path.join(root, 'index.html'));
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexFile = path.join(filePath, 'index.html');
    if (fs.existsSync(indexFile)) {
      res.sendFile(indexFile);
      return;
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.sendFile(filePath);
    return;
  }

  if (!path.extname(filePath)) {
    const htmlFile = `${filePath}.html`;
    if (fs.existsSync(htmlFile) && fs.statSync(htmlFile).isFile()) {
      res.sendFile(htmlFile);
      return;
    }
  }

  res.status(404).sendFile(path.join(root, '404.html'));
}

app.get('*', sendExistingFile);

app.listen(port, () => {
  console.log(`Talon is running on port ${port}`);
});
