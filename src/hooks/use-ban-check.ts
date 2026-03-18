"use client"

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export function useBanCheck(userId: string | undefined) {
  const router = useRouter();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownToastRef = useRef(false);

  useEffect(() => {
    if (!userId) {
      // Clear interval if no user
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      hasShownToastRef.current = false;
      return;
    }

    // Function to check ban status
    const checkBanStatus = async () => {
      try {
        const response = await fetch('/api/auth/check-ban', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        const data = await response.json();

        if (data.banned && !hasShownToastRef.current) {
          // User is banned - logout and show notification
          hasShownToastRef.current = true;
          
          // Show toast notification
          toast.error('Akun Anda telah diblokir', {
            description: `Alasan: ${data.reason || 'Pelanggaran kebijakan'}`,
            duration: 5000,
          });

          // Clear interval
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
          }

          // Sign out user
          await authClient.signOut();
          localStorage.removeItem('bearer_token');

          // Redirect to home page after short delay
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 1000);
        }
      } catch (error) {
        console.error('Ban check error:', error);
      }
    };

    // Initial check
    checkBanStatus();

    // Set up interval to check every 10 seconds
    checkIntervalRef.current = setInterval(checkBanStatus, 10000);

    // Cleanup function
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [userId, router]);
}
