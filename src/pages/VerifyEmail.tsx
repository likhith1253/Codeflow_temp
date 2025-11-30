import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string>('');
  const { isSignInLink, signInWithLink } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const url = window.location.href;
        
        if (isSignInLink(url)) {
          // Get the email from localStorage or prompt the user to enter it
          let email = window.localStorage.getItem('emailForSignIn');
          
          if (!email) {
            // If the user opened the link on a different device, prompt for email
            email = window.prompt('Please provide your email for confirmation');
          }
          
          if (email) {
            await signInWithLink(email, url);
            setStatus('success');
            // Redirect to home after successful verification
            setTimeout(() => navigate('/'), 2000);
          } else {
            throw new Error('Email is required for sign-in');
          }
        } else {
          throw new Error('Invalid verification link');
        }
      } catch (error: any) {
        console.error('Email verification error:', error);
        setStatus('error');
        setError(error.message || 'Failed to verify email. Please try again.');
      }
    };

    verifyEmail();
  }, [isSignInLink, signInWithLink, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-lg">
        {status === 'verifying' && (
          <div className="flex flex-col items-center">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <h1 className="mb-2 text-2xl font-bold">Verifying your email...</h1>
            <p className="text-muted-foreground">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-2xl font-bold">Email Verified!</h1>
            <p className="mb-6 text-muted-foreground">You have successfully signed in.</p>
            <Button onClick={() => navigate('/')}>
              Go to Dashboard
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-2xl font-bold">Verification Failed</h1>
            <p className="mb-4 text-muted-foreground">{error}</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate('/login')}>
                Back to Login
              </Button>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
