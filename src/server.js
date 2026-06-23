const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const port = 4000;

app.use(express.json());

app.use(session({
  secret: 'capivara', 
  resave: false,                                 
  saveUninitialized: false,                      
  cookie: { 
    secure: false,                               
    maxAge: 1000 * 60 * 60 * 2  
  }
}));

app.use(express.static(path.join(__dirname, '..', 'public')));

const rotasUsuarios = require('./routes/usuarios');
const rotasLivros = require('./routes/livros');
const rotasEmprestimos = require('./routes/emprestimos');

app.use('/api/usuarios', rotasUsuarios);
app.use('/api/livros', rotasLivros);
app.use('/api/emprestimos', rotasEmprestimos);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/bibliotecario', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'bibliotecario.html'));
});

app.get('/leitor', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'leitor.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});