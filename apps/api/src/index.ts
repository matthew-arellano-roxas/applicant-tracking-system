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
const app = express();

app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

passport.use('local', passwordStrategy);
app.use(passport.initialize());

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
