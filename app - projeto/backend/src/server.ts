import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes/index.js'; // <-- ADICIONE ESTA LINHA

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Torna a pasta de uploads pública
app.use('/uploads', express.static(path.join(process.cwd(), 'src', 'uploads')));

// Conecta as rotas do arquivo index.ts ao servidor
app.use(router); // <-- ADICIONE ESTA LINHA

app.get('/', (req, res) => {
  res.send('Servidor do Chatbot Fatec Jacareí em execução!');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});