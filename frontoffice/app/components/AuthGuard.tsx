'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { storage } from '../lib/storage';
import { authHelpers } from '../lib/auth-helpers';

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Allow access to public paths immediately
        if (PUBLIC_PATHS.includes(pathname)) {
            setAuthorized(true);
            return;
        }

        // Check authentication for protected paths
        const token = storage.getToken();
        if (!token) {
            // Redirect to login with return URL
            authHelpers.setReturnUrl(pathname);
            router.push('/login');
        } else {
            setAuthorized(true);
        }
    }, [pathname, router]);

    // Show nothing while checking auth for protected routes
    if (!authorized && !PUBLIC_PATHS.includes(pathname)) {
        return null;
    }

    return <>{children}</>;
}
