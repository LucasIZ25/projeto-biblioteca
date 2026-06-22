const express = require('express');
const router = express.Router();

const db = require('../config/db'); 
const conexao = db.promise();

// Rotina interna
async function atualizarEmprestimosAtrasados() {
  await conexao.query(`
    UPDATE emprestimos
    SET status = 'atrasado'
    WHERE status = 'ativo'
    AND data_devolucao_prevista < CURDATE()
    AND data_devolucao_real IS NULL
  `);
}

// GET: /api/emprestimos
router.get('/', async (req, res) => {
  try {
    await atualizarEmprestimosAtrasados();
    const { leitor_id } = req.query;

    let sql = `
      SELECT e.id, e.livro_id, e.leitor_id, u.nome AS leitor_nome, l.titulo AS livro_titulo,
             e.data_emprestimo, e.data_devolucao_prevista, e.data_devolucao_real, e.status
      FROM emprestimos e
      INNER JOIN livros l ON e.livro_id = l.id
      INNER JOIN usuarios u ON e.leitor_id = u.id
    `;
    const params = [];

    if (leitor_id) {
      sql += ' WHERE e.leitor_id = ?';
      params.push(leitor_id);
    }
    sql += ' ORDER BY e.id DESC';

    const [emprestimos] = await conexao.query(sql, params);
    res.json(emprestimos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao listar empréstimos.' });
  }
});

// POST: /api/emprestimos
router.post('/', async (req, res) => {
  try {
    const { livro_id, leitor_id } = req.body;

    if (!livro_id || !leitor_id) {
      return res.status(400).json({ mensagem: 'Livro e leitor são obrigatórios.' });
    }

    await conexao.beginTransaction();

    const [livros] = await conexao.query(
      `SELECT id, quantidade_disponivel FROM livros WHERE id = ? FOR UPDATE`, [livro_id]
    );

    if (livros.length === 0) {
      await conexao.rollback();
      return res.status(404).json({ mensagem: 'Livro não encontrado.' });
    }

    if (livros[0].quantidade_disponivel <= 0) {
      await conexao.rollback();
      return res.status(400).json({ mensagem: 'Livro indisponível.' });
    }

    const [resultado] = await conexao.query(
      `INSERT INTO emprestimos (livro_id, leitor_id, data_emprestimo, data_devolucao_prevista, status)
       VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'ativo')`,
      [livro_id, leitor_id]
    );

    await conexao.query(
      `UPDATE livros SET quantidade_disponivel = quantidade_disponivel - 1 WHERE id = ?`, [livro_id]
    );

    await conexao.commit();

    const [novoEmprestimo] = await conexao.query(
      `SELECT * FROM emprestimos WHERE id = ?`, [resultado.insertId]
    );

    res.status(201).json(novoEmprestimo[0]);
  } catch (error) {
    await conexao.rollback();
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao criar empréstimo.' });
  }
});

// PUT: /api/emprestimos/:id/devolver
router.put('/:id/devolver', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await conexao.beginTransaction();

    const [emprestimos] = await conexao.query(
      `SELECT id, livro_id, status FROM emprestimos WHERE id = ? FOR UPDATE`, [id]
    );

    if (emprestimos.length === 0) {
      await conexao.rollback();
      return res.status(404).json({ mensagem: 'Empréstimo não encontrado.' });
    }

    if (emprestimos[0].status === 'devolvido') {
      await conexao.rollback();
      return res.status(400).json({ mensagem: 'Este livro já foi devolvido.' });
    }

    await conexao.query(
      `UPDATE emprestimos SET data_devolucao_real = CURDATE(), status = 'devolvido' WHERE id = ?`, [id]
    );

    await conexao.query(
      `UPDATE livros SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = ?`,
      [emprestimos[0].livro_id]
    );

    await conexao.commit();
    res.json({ mensagem: 'Devolução aprovada com sucesso.' });
  } catch (error) {
    await conexao.rollback();
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao aprovar devolução.' });
  }
});

// DELETE: /api/emprestimos/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [resultado] = await conexao.query(`DELETE FROM emprestimos WHERE id = ?`, [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Empréstimo não encontrado.' });
    }
    res.json({ mensagem: 'Empréstimo removido com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao remover empréstimo.' });
  }
});

module.exports = router;