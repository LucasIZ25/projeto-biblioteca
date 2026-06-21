const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/livros', (req, res) => {
  const sql = `
    SELECT 
      id,
      titulo,
      autor,
      ano,
      quantidade_total AS quantidade,
      quantidade_disponivel AS disponivel
    FROM livros
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    res.json(results);
  });
});

router.post('/livros', (req, res) => {
  const { titulo, autor, ano, quantidade } = req.body;

  const sql = `
    INSERT INTO livros 
    (titulo, autor, ano, quantidade_total, quantidade_disponivel)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [titulo, autor, ano, quantidade, quantidade], (err, result) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    res.status(201).json({
      id: result.insertId,
      titulo,
      autor,
      ano,
      quantidade,
      disponivel: quantidade
    });
  });
});

router.put('/livros/:id', (req, res) => {
  const id = req.params.id;
  const { titulo, autor, ano, quantidade, disponivel } = req.body;

  const sql = `
    UPDATE livros
    SET titulo = ?, autor = ?, ano = ?, quantidade_total = ?, quantidade_disponivel = ?
    WHERE id = ?
  `;

  db.query(sql, [titulo, autor, ano, quantidade, disponivel, id], (err) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    res.json({
      mensagem: 'Livro atualizado com sucesso'
    });
  });
});

router.delete('/livros/:id', (req, res) => {
  const id = req.params.id;

  const sql = 'DELETE FROM livros WHERE id = ?';

  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    res.json({
      mensagem: 'Livro removido com sucesso'
    });
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