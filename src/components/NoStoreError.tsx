"use client";

interface NoStoreErrorProps {
  message?: string;
}

export default function NoStoreError({
  message = "Store not found",
}: NoStoreErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          No Store Found
        </h1>
        <p className="text-slate-600 mb-6">{message}</p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <p className="text-sm text-blue-900 font-medium mb-2">What&apos;s next?</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Check your store link is correct</li>
            <li>• Contact the agent who sent you the link</li>
            <li>• Make sure the store is active</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
