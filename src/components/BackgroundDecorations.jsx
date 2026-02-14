import React from 'react';

export default function BackgroundDecorations() {
    return (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
            {/* Scanline effect overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiAvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAwLCAwLjAzKSIgLz4KPC9zdmc+')] opacity-30 pointer-events-none" />
        </div>
    );
}
