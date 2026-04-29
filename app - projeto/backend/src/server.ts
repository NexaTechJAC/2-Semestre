import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Torna a pasta de uploads pública para o navegador acessar os PDFs
app.use('/uploads', express.static(path.join(process.cwd(), 'src', 'uploads')));

app.get('/', (req, res) => {
  res.send('Servidor do Chatbot Fatec Jacareí em execução!');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});