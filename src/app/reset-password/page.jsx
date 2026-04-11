'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ResetPasswordContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const token = useMemo(() => (searchParams.get('token') || '').trim(), [searchParams]);

    const [newPassword, setnewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingToken, setIsCheckingToken] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setIsTokenValid(false);
                setError('Reset token is missing. Please use the link from your email.');
                setIsCheckingToken(false);
                return;
            }

            try {
                const response = await fetch(`/api/auth/verify-token?token=${encodeURIComponent(token)}`);
                const data = await response.json();

                if (response.ok) {
                    setIsTokenValid(true);
                    setError('');
                } else {
                    setIsTokenValid(false);
                    setError(data.error || 'Invalid or expired reset link.');
                }
            } catch (err) {
                console.error('Token verification error:', err);
                setIsTokenValid(false);
                setError('Could not verify reset link. Please try again.');
            } finally {
                setIsCheckingToken(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password: newPassword,
                    confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Unable to reset password.');
                return;
            }

            setMessage(data.message || 'Password reset successful. Redirecting to login...');
            setTimeout(() => {
                router.push('/login');
            }, 1800);
        } catch (err) {
            console.error('Reset password error:', err);
            setError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md rounded-2xl border border-amber-100 bg-white/90 backdrop-blur shadow-xl p-6 sm:p-8">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">Reset Password</h1>
                    <p className="mt-2 text-sm text-neutral-600">Enter a new password for your account.</p>
                </div>

                {isCheckingToken ? (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <p className="text-sm text-blue-700">Verifying your reset link...</p>
                    </div>
                ) : !isTokenValid ? (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                            <p className="text-sm text-red-700">{error || 'Invalid or expired reset link.'}</p>
                        </div>
                        <Link
                            href="/forgot-password"
                            className="block w-full text-center rounded-md bg-neutral-900 text-white px-4 py-2.5 hover:bg-neutral-800 transition"
                        >
                            Request New Reset Link
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                                New Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setnewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full rounded-md border border-neutral-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
                                className="w-full rounded-md border border-neutral-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-md bg-neutral-900 text-white px-4 py-2.5 hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                            {isSubmitting ? 'Updating password...' : 'Update Password'}
                        </button>

                        {message && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <p className="text-sm text-blue-700">{message}</p>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <p className="text-center text-sm text-neutral-600">
                            Remembered your password?{' '}
                            <Link href="/login" className="font-medium text-neutral-900 hover:underline">
                                Back to Login
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

const ResetPasswordFallback = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-amber-100 bg-white/90 backdrop-blur shadow-xl p-6 sm:p-8">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-700">Loading reset page...</p>
            </div>
        </div>
    </div>
);

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordFallback />}>
            <ResetPasswordContent />
        </Suspense>
    );
}