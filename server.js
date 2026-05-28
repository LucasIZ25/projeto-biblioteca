const express = require('express');
const path = require('path');

const app = express();
const port = 4000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/bibliotecario', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bibliotecario.html'));
});

app.get('/leitor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'leitor.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});