import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatHandler from '../api/echo/chat.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

// O chatHandler é a mesma função serverless usada pelo Vercel em produção.
// Assim garantimos que o ambiente local e de produção executam exatamente o mesmo código.
app.all('/api/echo/chat', async (req, res) => {
  await chatHandler(req, res);
});

app.listen(port, () => {
  console.log(`_echo backend listening on port ${port}`);
});
