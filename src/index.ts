import express, { Request, Response } from 'express';
import { env } from '@/configs';
import { errorHandler } from '@/errors';
import { authRoute } from '@/routes';
import passport from 'passport';
import { passwordStrategy } from '@/strategies';
import cookieParser from 'cookie-parser';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

passport.use('local', passwordStrategy);
app.use(passport.initialize());

app.use(authRoute);
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Hello from Express + TypeScript' });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
