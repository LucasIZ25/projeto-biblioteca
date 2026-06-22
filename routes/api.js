const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/livros/:id', (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT 
      id,
      titulo,
      autor,
      ano,
      quantidade_total AS quantidade,
      quantidade_disponivel AS disponivel
    FROM livros
    WHERE id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({
        mensagem: 'Livro não encontrado'
      });
    }

    res.json(results[0]);
  });
});

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

module.exports = router;