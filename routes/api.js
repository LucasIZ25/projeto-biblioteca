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
      return res.status(404).json({ mensagem: 'Livro não encontrado' });
    }

    res.json(results[0]);
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

    res.json({ mensagem: 'Livro atualizado com sucesso' });
  });
});

router.delete('/livros/:id', (req, res) => {
  const id = req.params.id;

  const sql = 'DELETE FROM livros WHERE id = ?';

  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    res.json({ mensagem: 'Livro removido com sucesso' });
  });
});

router.post('/emprestimos', (req, res) => {
  const { livro_id, leitor_id } = req.body;

  const sqlLivro = `
    SELECT quantidade_disponivel
    FROM livros
    WHERE id = ?
  `;

  db.query(sqlLivro, [livro_id], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ mensagem: 'Livro não encontrado' });
    }

    if (results[0].quantidade_disponivel <= 0) {
      return res.status(400).json({ mensagem: 'Livro indisponível' });
    }

    const sqlEmprestimo = `
      INSERT INTO emprestimos
      (livro_id, leitor_id, data_emprestimo, data_devolucao_prevista, status)
      VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'ativo')
    `;

    db.query(sqlEmprestimo, [livro_id, leitor_id], (err) => {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }

      const sqlAtualizarLivro = `
        UPDATE livros
        SET quantidade_disponivel = quantidade_disponivel - 1
        WHERE id = ?
      `;

      db.query(sqlAtualizarLivro, [livro_id], (err) => {
        if (err) {
          return res.status(500).json({ erro: err.message });
        }

        res.status(201).json({
          mensagem: 'Empréstimo realizado com sucesso'
        });
      });
    });
  });
});

router.get('')



router.get('/emprestimos/:leitorId', (req, res) => {
  const leitorId = req.params.leitorId;

  const sql = `
    SELECT
      e.id,
      l.titulo AS livro,
      e.data_emprestimo,
      e.data_devolucao_prevista,
      e.status
    FROM emprestimos e
    JOIN livros l ON l.id = e.livro_id
    WHERE e.leitor_id = ?
  `;

  db.query(sql, [leitorId], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    res.json(results);
  });
});

router.put('/emprestimos/:id/devolver', (req, res) => {
  const id = req.params.id;

  const sqlBuscar = `
    SELECT livro_id, status
    FROM emprestimos
    WHERE id = ?
  `;

  db.query(sqlBuscar, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ mensagem: 'Empréstimo não encontrado' });
    }

    if (results[0].status === 'devolvido') {
      return res.status(400).json({ mensagem: 'Livro já foi devolvido' });
    }

    const livroId = results[0].livro_id;

    const sqlDevolver = `
      UPDATE emprestimos
      SET status = 'devolvido',
          data_devolucao_real = CURDATE()
      WHERE id = ?
    `;

    db.query(sqlDevolver, [id], (err) => {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }

      const sqlAtualizarLivro = `
        UPDATE livros
        SET quantidade_disponivel = quantidade_disponivel + 1
        WHERE id = ?
      `;

      db.query(sqlAtualizarLivro, [livroId], (err) => {
        if (err) {
          return res.status(500).json({ erro: err.message });
        }

        res.json({ mensagem: 'Livro devolvido com sucesso' });
      });
    });
  });
});

module.exports = router;