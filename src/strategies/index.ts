import passport from 'passport';
import { PASSWORD_STRATEGY, passwordStrategy } from './password.strategy';

export const registerStrategies = (): void => {
  passport.use(PASSWORD_STRATEGY, passwordStrategy);
};
