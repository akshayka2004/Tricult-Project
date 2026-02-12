import React from 'react';

export default function BackgroundDecorations() {
    // Static configuration: One image per corner/edge for maximum visibility without clutter
    const elements = [
        { id: 0, top: '0%', left: '0%', size: '300px', duration: '25s', delay: '0s', imgIndex: 1 }, // Top Left
        { id: 1, top: '0%', right: '0%', size: '300px', duration: '28s', delay: '1s', imgIndex: 2 }, // Top Right
        { id: 2, bottom: '0%', left: '0%', size: '350px', duration: '30s', delay: '2s', imgIndex: 3 }, // Bottom Left
        { id: 3, bottom: '0%', right: '0%', size: '350px', duration: '32s', delay: '0.5s', imgIndex: 4 }, // Bottom Right
    ];

    return (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
            {/* Floating elements */}
            {elements.map((el) => (
                <div
                    key={el.id}
                    className="absolute opacity-80 animate-float"
                    style={{
                        top: el.top,
                        bottom: el.bottom,
                        left: el.left,
                        right: el.right,
                        width: el.size,
                        height: el.size,
                        backgroundImage: `url(/assets/backgrounds/bg${el.imgIndex}.png)`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        animationDelay: el.delay,
                        animationDuration: el.duration,
                        filter: 'drop-shadow(0 0 20px rgba(255, 255, 0, 0.2))'
                    }}
                />
            ))}

            {/* Scanline effect overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiAvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAwLCAwLjAzKSIgLz4KPC9zdmc+')] opacity-30 pointer-events-none" />
        </div>
    );
}
