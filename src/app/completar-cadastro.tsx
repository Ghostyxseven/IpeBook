import { Redirect } from 'expo-router';
import { useAppSession } from '../factories/auth';
import { GoogleRegistrationScreen } from '../view/screens/auth/GoogleRegistrationScreen';
import { SessionPendingScreen } from '../view/screens/SessionPendingScreen';
import { OfflineBanner } from '../view/components/feedback/OfflineBanner';

export default function CompleteRegistrationRoute() {
  const session = useAppSession();
  if (session.status === 'loading') return <SessionPendingScreen session={session} />;
  if (!session.user) return <Redirect href="/entrar" />;
  if (!session.user.needsRegistration) return <Redirect href="/inicio" />;
  return (
    <>
      <OfflineBanner />
      <GoogleRegistrationScreen key={session.user.id} user={session.user} />
    </>
  );
}
