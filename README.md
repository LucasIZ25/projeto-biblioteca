<h1 align="center">📚 Sistema de Gestão de Biblioteca</h1>

<p align="center">
  Projeto acadêmico desenvolvido para gerenciar livros, usuários e empréstimos em uma biblioteca.
</p>

<hr>

<h2>🚀 Funcionalidades</h2>

<ul>
  <li>Cadastro e login de usuários</li>
  <li>Perfis de bibliotecário e leitor</li>
  <li>Cadastro, edição e exclusão de livros</li>
  <li>Listagem de livros no catálogo do leitor</li>
  <li>Controle de quantidade disponível</li>
  <li>Integração com banco de dados MySQL</li>
</ul>

<h2>🛠️ Tecnologias Utilizadas</h2>

<ul>
  <li>HTML5</li>
  <li>CSS3</li>
  <li>JavaScript</li>
  <li>Node.js</li>
  <li>Express.js</li>
  <li>MySQL</li>
  <li>MySQL Workbench</li>
</ul>

<h2>📂 Estrutura do Projeto</h2>

<pre>
Projeto-Biblioteca
│
├── public
│   ├── index.html
│   ├── bibliotecario.html
│   ├── leitor.html
│   ├── style.css
│   ├── bibliotecario.css
│   ├── leitor.css
│   ├── app.js
│   ├── bibliotecario.js
│   └── leitor.js
│
├── routes
│   └── api.js
│
├── db.js
├── server.js
├── package.json
└── README.md
</pre>

<h2>⚙️ Como Executar o Projeto</h2>

<ol>
  <li>Clone o repositório:</li>
</ol>

<pre>
git clone https://github.com/LucasIZ25/projeto-biblioteca.git
</pre>

<ol start="2">
  <li>Entre na pasta do projeto:</li>
</ol>

<pre>
cd projeto-biblioteca
</pre>

<ol start="3">
  <li>Instale as dependências:</li>
</ol>

<pre>
npm install
</pre>

<ol start="4">
  <li>Configure o banco de dados MySQL com o nome:</li>
</ol>

<pre>
biblioteca
</pre>

<ol start="5">
  <li>Inicie o servidor:</li>
</ol>

<pre>
node server.js
</pre>

<p>Acesse no navegador:</p>

<pre>
http://localhost:4000
</pre>

<h2>📡 Rotas da API</h2>

<table>
  <tr>
    <th>Método</th>
    <th>Rota</th>
    <th>Descrição</th>
  </tr>
  <tr>
    <td>GET</td>
    <td>/api/livros</td>
    <td>Lista todos os livros</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/api/livros</td>
    <td>Cadastra um novo livro</td>
  </tr>
  <tr>
    <td>PUT</td>
    <td>/api/livros/:id</td>
    <td>Atualiza um livro existente</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>/api/livros/:id</td>
    <td>Remove um livro</td>
  </tr>
</table>
