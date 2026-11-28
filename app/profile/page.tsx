import Profile from './profile';
export const metadata = {
  title: 'Mta · Мой профиль',
  robots: { index: false, follow: false },
};
export default function Page() {
  return <Profile />;
}
