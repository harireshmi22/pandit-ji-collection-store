'use client'

export default function GlobalError({ error, reset }) {
    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Critical Error</h2>
                        <p className="text-gray-600 mb-6">
                            Something went wrong in the application. We apologize for the inconvenience.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => reset()}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors font-medium"
                            >
                                Try again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors font-medium"
                            >
                                Reload Page
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && error && (
                            <div className="mt-8 text-left bg-gray-100 p-4 rounded overflow-auto">
                                <p className="text-xs font-mono text-red-500 break-words">{error.message}</p>
                            </div>
                        )}
                    </div>
                </div>
            </body>
        </html>
    )
}
