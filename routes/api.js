const express = require('express');
const router = express.Router();

const db = require('../db');
const conexao = db.promise();

function formatarData(data) {
  if (!data) return null;
  return new Date(data).toISOString().slice(0, 10);
}

async function atualizarEmprestimosAtrasados() {
  await conexao.query(`
    UPDATE emprestimos
    SET status = 'atrasado'
    WHERE status = 'ativo'
    AND data_devolucao_prevista < CURDATE()
    AND data_devolucao_real IS NULL
  `);
}

router.post('/usuarios/cadastro', async (req, res) => {
  try {
    const { nome, email, senha, perfil } = req.body;

    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({
        mensagem: 'Preencha todos os campos.'
      });
    }

    if (perfil !== 'bibliotecario' && perfil !== 'leitor') {
      return res.status(400).json({
        mensagem: 'Perfil inválido.'
      });
    }

    const [resultado] = await conexao.query(
      `
      INSERT INTO usuarios (nome, email, senha, perfil)
      VALUES (?, ?, ?, ?)
      `,
      [nome, email, senha, perfil]
    );

    res.status(201).json({
      id: resultado.insertId,
      nome,
      email,
      perfil
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        mensagem: 'Este e-mail já está cadastrado.'
      });
    }

    console.error(error);

    res.status(500).json({
      mensagem: 'Erro ao cadastrar usuário.'
    });
  }
});

router.post('/usuarios/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        mensagem: 'Informe e-mail e senha.'
      });
    }

    const [usuarios] = await conexao.query(
      `
      SELECT id, nome, email, perfil
      FROM usuarios
      WHERE email = ? AND senha = ?
      `,
      [email, senha]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        mensagem: 'E-mail ou senha incorretos.'
      });
    }

    res.json(usuarios[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensagem: 'Erro ao fazer login.'
    });
  }
});

router.get('/livros', async (req, res) => {
  try {
    const [livros] = await conexao.query(`
      SELECT
        id,
        titulo,
        autor,
        ano_publicacao AS ano,
        quantidade_disponivel AS quantidade,
        quantidade_disponivel AS disponivel
      FROM livros
      ORDER BY id DESC
    `);

    res.json(livros);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensagem: 'Erro ao listar livros.'
    });
  }
});

router.post('/livros', async (req, res) => {
  try {
    const { titulo, autor, ano, quantidade } = req.body;

    if (!titulo || !autor || quantidade === undefined) {
      return res.status(400).json({
        mensagem: 'Título, autor e quantidade são obrigatórios.'
      });
    }

    const [resultado] = await conexao.query(
      `
      INSERT INTO livros (titulo, autor, ano_publicacao, quantidade_disponivel)
      VALUES (?, ?, ?, ?)
      `,
      [titulo, autor, ano || null, quantidade]
    );

    res.status(201).json({
      id: resultado.insertId,
      titulo,
      autor,
      ano,
      quantidade,
      disponivel: quantidade
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensagem: 'Erro ao cadastrar livro.'
    });
  }
});

router.put('/livros/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { titulo, autor, ano, quantidade } = req.body;

    if (!titulo || !autor || quantidade === undefined) {
      return res.status(400).json({
        mensagem: 'Título, autor e quantidade são obrigatórios.'
      });
    }

    const [resultado] = await conexao.query(
      `
      UPDATE livros
      SET titulo = ?, autor = ?, ano_publicacao = ?, quantidade_disponivel = ?
      WHERE id = ?
      `,
      [titulo, autor, ano || null, quantidade, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Livro não encontrado.'
      });
    }

    res.json({
      id,
      titulo,
      autor,
      ano,
      quantidade,
      disponivel: quantidade
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensagem: 'Erro ao atualizar livro.'
    });
  }
});

router.delete('/livros/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [resultado] = await conexao.query(
      `
      DELETE FROM livros
      WHERE id = ?
      `,
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Livro não encontrado.'
      });
    }

    res.json({
      mensagem: 'Livro removido com sucesso.'
    });

  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        mensagem: 'Não é possível excluir um livro que já possui empréstimos.'
      });
    }

    console.error(error);

    res.status(500).json({
      mensagem: 'Erro ao remover livro.'
    });
  }
});

router.get('/emprestimos', async (req, res) => {
  try {
    await atualizarEmprestimosAtrasados();

    const { leitor_id } = req.query;

    let sql = `
      SELECT
        e.id,
        e.livro_id,
        e.leitor_id,
        u.nome AS leitor_nome,
        l.titulo AS livro_titulo,
        e.data_emprestimo,
        e.data_devolucao_prevista,
        e.data_devolucao_real,
        e.status
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

    res.status(500).json({
      mensagem: 'Erro ao listar empréstimos.'
    });
  }
});

router.post('/emprestimos', async (req, res) => {
  try {
    const { livro_id, leitor_id } = req.body;

    if (!livro_id || !leitor_id) {
      return res.status(400).json({
        mensagem: 'Livro e leitor são obrigatórios.'
      });
    }

    await conexao.beginTransaction();

    const [livros] = await conexao.query(
      `
      SELECT id, quantidade_disponivel
      FROM livros
      WHERE id = ?
      FOR UPDATE
      `,
      [livro_id]
    );

    if (livros.length === 0) {
      await conexao.rollback();

      return res.status(404).json({
        mensagem: 'Livro não encontrado.'
      });
    }

    const livro = livros[0];

    if (livro.quantidade_disponivel <= 0) {
      await conexao.rollback();

      return res.status(400).json({
        mensagem: 'Livro indisponível.'
      });
    }

    const hoje = new Date();
    const dataEmprestimo = formatarData(hoje);

    const devolucaoPrevista = new Date();
    devolucaoPrevista.setDate(devolucaoPrevista.getDate() + 7);
    const dataDevolucaoPrevista = formatarData(devolucaoPrevista);

    const [resultado] = await conexao.query(
      `
      INSERT INTO emprestimos
      (livro_id, leitor_id, data_emprestimo, data_devolucao_prevista, status)
      VALUES (?, ?, ?, ?, 'ativo')
      `,
      [livro_id, leitor_id, dataEmprestimo, dataDevolucaoPrevista]
    );

    await conexao.query(
      `
      UPDATE livros
      SET quantidade_disponivel = quantidade_disponivel - 1
      WHERE id = ?
      `,
      [livro_id]
    );

    await conexao.commit();

    res.status(201).json({
      id: resultado.insertId,
      livro_id,
      leitor_id,
      data_emprestimo: dataEmprestimo,
      data_devolucao_prevista: dataDevolucaoPrevista,
      data_devolucao_real: null,
      status: 'ativo'
    });

  } catch (error) {
    await conexao.rollback();

    console.error(error);

    res.status(500).json({
      mensagem: 'Erro ao criar empréstimo.'
    });
  }
});

router.put('/emprestimos/:id/devolver', async (req, res) => {
  try {
    const id = Number(req.params.id);

    await conexao.beginTransaction();

    const [emprestimos] = await conexao.query(
      `
      SELECT id, livro_id, status
      FROM emprestimos
      WHERE id = ?
      FOR UPDATE
      `,
      [id]
    );

    if (emprestimos.length === 0) {
      await conexao.rollback();

      return res.status(404).json({
        mensagem: 'Empréstimo não encontrado.'
      });
    }

    const emprestimo = emprestimos[0];

    if (emprestimo.status === 'devolvido') {
      await conexao.rollback();

      return res.status(400).json({
        mensagem: 'Este livro já foi devolvido.'
      });
    }

    await conexao.query(
      `
      UPDATE emprestimos
      SET data_devolucao_real = CURDATE(), status = 'devolvido'
      WHERE id = ?
      `,
      [id]
    );

    await conexao.query(
      `
      UPDATE livros
      SET quantidade_disponivel = quantidade_disponivel + 1
      WHERE id = ?
      `,
      [emprestimo.livro_id]
    );

    await conexao.commit();

    res.json({
      mensagem: 'Devolução aprovada com sucesso.'
    });

  } catch (error) {
    await conexao.rollback();

    console.error(error);

    res.status(500).json({
      mensagem: 'Erro ao aprovar devolução.'
    });
  }
});

router.delete('/emprestimos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [resultado] = await conexao.query(
      `
      DELETE FROM emprestimos
      WHERE id = ?
      `,
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Empréstimo não encontrado.'
      });
    }

    res.json({
      mensagem: 'Empréstimo removido com sucesso.'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensagem: 'Erro ao remover empréstimo.'
    });
  }
});

module.exports = router;