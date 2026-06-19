import { LoginForm } from './login-form';

export default function LoginPage() {
  const enableTestLoginShortcut =
    process.env.TEST_LOGIN_SHORTCUT === 'true' || process.env.TEST_LOGIN_SHORTCUT === '1';

  return <LoginForm enableTestLoginShortcut={enableTestLoginShortcut} />;
}
