const express = require('express');
const router = express.Router();

let livros = [];
let emprestimos = [];

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

router.get('/emprestimos', (req, res) => {
  res.json(emprestimos);
});

router.post('/emprestimos', (req, res) => {
  const { livro_id, leitor_id, data_devolucao_prevista } = req.body;

  const livro = livros.find(livro => livro.id === livro_id);

  if (!livro) {
    return res.status(404).json({
      mensagem: 'Livro não encontrado'
    });
  }

  if (livro.disponivel <= 0) {
    return res.status(400).json({
      mensagem: 'Livro indisponível'
    });
  }

  livro.disponivel--;

  const novoEmprestimo = {
    id: Date.now(),
    livro_id,
    leitor_id,
    data_emprestimo: new Date(),
    data_devolucao_prevista,
    data_devolucao_real: null,
    status: 'ativo'
  };

  emprestimos.push(novoEmprestimo);

  res.status(201).json(novoEmprestimo);
});

router.put('/emprestimos/:id/devolver', (req, res) => {
  const id = Number(req.params.id);

  const emprestimo = emprestimos.find(e => e.id === id);

  if (!emprestimo) {
    return res.status(404).json({
      mensagem: 'Empréstimo não encontrado'
    });
  }

  if (emprestimo.status === 'devolvido') {
    return res.status(400).json({
      mensagem: 'Livro já devolvido'
    });
  }

  const livro = livros.find(
    livro => livro.id === emprestimo.livro_id
  );

  if (livro) {
    livro.disponivel++;
  }

  emprestimo.data_devolucao_real = new Date();
  emprestimo.status = 'devolvido';

  res.json(emprestimo);
});

module.exports = router;