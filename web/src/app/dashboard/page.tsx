import { redirect } from 'next/navigation';

export default function Dashboard() {
  // Authentication is now handled by middleware
  // Users will be redirected to sign-in if not authenticated
  redirect('/dashboard/overview');
}
