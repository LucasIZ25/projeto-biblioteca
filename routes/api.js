const express = require('express');
const router = express.Router();

let livros = [];

router.get('/livros', (req, res) => {
  res.json(livros);
});

router.post('/livros', (req, res) => {
  const { titulo, autor, ano, quantidade } = req.body;

  const novoLivro = {
    id: Date.now(),
    titulo: titulo,
    autor: autor,
    ano: ano,
    quantidade: quantidade,
    disponivel: quantidade
  };

  livros.push(novoLivro);

  res.status(201).json(novoLivro);
});

router.put('/livros/:id', (req, res) => {
  const id = Number(req.params.id);

  const livro = livros.find((livro) => livro.id === id);

  if (!livro) {
    return res.status(404).json({
      mensagem: 'Livro não encontrado'
    });
  }

  livro.titulo = req.body.titulo;
  livro.autor = req.body.autor;
  livro.ano = req.body.ano;
  livro.quantidade = req.body.quantidade;
  livro.disponivel = req.body.disponivel;

  res.json(livro);
});

router.delete('/livros/:id', (req, res) => {
  const id = Number(req.params.id);

  livros = livros.filter((livro) => livro.id !== id);

  res.json({
    mensagem: 'Livro removido com sucesso'
  });
});

module.exports = router;