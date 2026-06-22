const express = require('express');
const router = express.Router();

const db = require('../config/db'); 
const conexao = db.promise();


router.get('/', async (req, res) => {
  try {
    const [livros] = await conexao.query(`
      SELECT id, titulo, autor, ano_publicacao AS ano, 
             quantidade_disponivel AS quantidade, quantidade_disponivel AS disponivel
      FROM livros ORDER BY id DESC
    `);
    res.json(livros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao listar livros.' });
  }
});


router.post('/', async (req, res) => {
  try {
    const { titulo, autor, ano, quantidade } = req.body;

    if (!titulo || !autor || quantidade === undefined) {
      return res.status(400).json({ mensagem: 'Título, autor e quantidade são obrigatórios.' });
    }

    const [resultado] = await conexao.query(
      `INSERT INTO livros (titulo, autor, ano_publicacao, quantidade_disponivel) VALUES (?, ?, ?, ?)`,
      [titulo, autor, ano || null, quantidade]
    );

    res.status(201).json({ id: resultado.insertId, titulo, autor, ano, quantidade, disponivel: quantidade });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao cadastrar livro.' });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { titulo, autor, ano, quantity } = req.body; // Aceita quantidade vinda do body

    if (!titulo || !autor) {
      return res.status(400).json({ mensagem: 'Título e autor são obrigatórios.' });
    }

    const [resultado] = await conexao.query(
      `UPDATE livros SET titulo = ?, autor = ?, ano_publicacao = ?, quantidade_disponivel = ? WHERE id = ?`,
      [titulo, autor, ano || null, req.body.quantidade, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Livro não encontrado.' });
    }

    res.json({ id, titulo, autor, ano, quantidade: req.body.quantidade, disponivel: req.body.quantidade });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar livro.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [resultado] = await conexao.query(`DELETE FROM livros WHERE id = ?`, [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Livro não encontrado.' });
    }
    res.json({ mensagem: 'Livro removido com sucesso.' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ mensagem: 'Não é possível excluir um livro que já possui empréstimos.' });
    }
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao remover livro.' });
  }
});

module.exports = router;