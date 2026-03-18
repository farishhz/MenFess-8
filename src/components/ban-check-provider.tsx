"use client"

import { useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useBanCheck } from '@/hooks/use-ban-check';

export function BanCheckProvider() {
  const { data: session, isPending } = useSession();
  
  // Use the ban check hook with user ID
  useBanCheck(session?.user?.id);

  return null; // This component doesn't render anything
}
