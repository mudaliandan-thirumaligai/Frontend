import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  role?: string;
  exp?: number;
}

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token');

  if (!token) {
    router.navigate(['*']); // redirect to landing page if not logged in
    return false;
  }

  try {
    const decoded: DecodedToken = jwtDecode(token);

    // Check token expiry
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      sessionStorage.removeItem('token');
      router.navigate(['/']); // landing page
      return false;
    }

    // Only admin can access
    if (decoded.role === 'admin') {
      return true;
    } else {
      router.navigate(['/']); // landing page
      return false;
    }

  } catch (err) {
    sessionStorage.removeItem('token');
    router.navigate(['/']); // landing page
    return false;
  }
};
