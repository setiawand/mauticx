import { redirect } from 'next/navigation';

export default function Page() {
  // Redirect logic is now handled by middleware
  // This page will redirect unauthenticated users to sign-in
  // and authenticated users to dashboard
  redirect('/dashboard/overview');
}
