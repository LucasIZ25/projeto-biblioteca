const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const db = require('../config/db'); 
const conexao = db.promise();

// POST: /api/usuarios/cadastro
router.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha, perfil } = req.body;

    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({ mensagem: 'Preencha todos os campos.' });
    }

    if (perfil !== 'bibliotecario' && perfil !== 'leitor') {
      return res.status(400).json({ mensagem: 'Perfil inválido.' });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const [resultado] = await conexao.query(
      `INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)`,
      [nome, email, senhaCriptografada, perfil]
    );

    res.status(201).json({ id: resultado.insertId, nome, email, perfil });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ mensagem: 'Este e-mail já está cadastrado.' });
    }
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao cadastrar usuário.' });
  }
});

// POST: /api/usuarios/login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'Informe e-mail e senha.' });
    }

    const [usuarios] = await conexao.query(
      `SELECT id, nome, email, senha, perfil FROM usuarios WHERE email = ?`, [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }

    const usuario = usuarios[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }

    // Salva na sessão do servidor Express
    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      perfil: usuario.perfil
    };

    delete usuario.senha;
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao fazer login.' });
  }
});

// POST: /api/usuarios/logout
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ mensagem: 'Erro ao encerrar a sessão.' });
      }
      res.clearCookie('connect.sid');
      return res.json({ mensagem: 'Logout efetuado com sucesso.' });
    });
  } else {
    res.json({ mensagem: 'Nenhuma sessão ativa.' });
  }
});

module.exports = router;