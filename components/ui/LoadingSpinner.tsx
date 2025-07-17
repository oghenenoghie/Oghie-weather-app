'use client';

export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-12 h-12 border-4 border-white border-t-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-white text-lg">Loading...</p>
        </div>
    );
}
