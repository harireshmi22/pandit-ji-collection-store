import Link from 'next/link'

export default function NotFound() {
    return (
        <div className='min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center'>
            <p className='text-8xl font-bold text-neutral-100 mb-4'>404</p>
            <h2 className='text-lg font-semibold text-neutral-900 mb-2'>Page not found</h2>
            <p className='text-sm text-neutral-500 mb-8 max-w-sm'>The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
            <Link href='/' className='bg-neutral-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors'>
                Back to Home
            </Link>
        </div>
    )
}
