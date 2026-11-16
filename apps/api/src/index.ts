import express, { Request, Response } from 'express';
import { env } from '@/configs';
import { errorHandler } from '@/errors';
import {
  authRoute,
  applicantRoute,
  departmentRoute,
  cvRoute,
  interviewRoute,
  employeeRoute,
  hiringRequestRoute,
  jobPostRoute,
  userRoute,
  campusRoute,
} from '@/routes';
import passport from 'passport';
import { passwordStrategy } from '@/strategies';
import cookieParser from 'cookie-parser';
import { requestLogger } from '@/middlewares/request-logger.middleware';
import { invalidateGetResponseCache } from '@/middlewares/response-cache.middleware';
import { createRateLimit } from '@/middlewares/rate-limit.middleware';
const app = express();
const apiRateLimit = createRateLimit({
  keyPrefix: 'api:global',
  limit: 1_000,
  windowMs: 15 * 60_000,
});

const trustProxyHopsValue = process.env.TRUST_PROXY_HOPS;
if (trustProxyHopsValue !== undefined) {
  const trustProxyHops = Number(trustProxyHopsValue);
  if (!Number.isSafeInteger(trustProxyHops) || trustProxyHops < 0) {
    throw new Error('TRUST_PROXY_HOPS must be a non-negative integer');
  }
  app.set('trust proxy', trustProxyHops);
}

app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

passport.use('local', passwordStrategy);
app.use(passport.initialize());
app.use(invalidateGetResponseCache);
app.use(apiRateLimit);

app.use(authRoute);
app.use('/applications', applicantRoute);
app.use('/cvs', cvRoute);
app.use('/interviews', interviewRoute);
app.use('/departments', departmentRoute);
app.use('/campuses', campusRoute);
app.use('/employees', employeeRoute);
app.use('/users', userRoute);
app.use('/hiring-requests', hiringRequestRoute);
app.use('/job-posts', jobPostRoute);
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Hello from Express + TypeScript' });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
