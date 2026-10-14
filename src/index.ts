import express, { Request, Response } from 'express';
import { env } from '@/configs';
import { errorHandler } from '@/errors';

const app = express();
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Hello from Express + TypeScript' });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
