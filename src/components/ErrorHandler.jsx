'use client'

import { useEffect } from 'react'

export default function ErrorHandler() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const originalError = console.error;
            console.error = (...args) => {
                if (args[0] && args[0].message && args[0].message.includes('toString')) {
                    console.log('=== TO_STRING ERROR DETECTED ===');
                    console.log('Error:', args[0]);
                    console.log('Stack:', args[0].stack);
                    console.log('Arguments:', args);
                    console.log('=== END ERROR DETAILS ===');
                }
                originalError(...args);
            };

            return () => {
                console.error = originalError;
            };
        }
    }, []);

    return null;
}
