import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, Smartphone } from 'lucide-react';

export default function QRScanner({ onScan, disabled }) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState('');
    const scannerRef = useRef(null);
    const containerRef = useRef(null);

    const startScanner = async () => {
        if (scannerRef.current) return;
        setError('');

        try {
            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 220, height: 220 },
                    aspectRatio: 1,
                },
                (decodedText) => {
                    onScan(decodedText);
                    stopScanner();
                },
                () => { }
            );
            setIsScanning(true);
        } catch (err) {
            setError('Camera access denied or not available. Please allow camera permissions in your browser settings.');
            scannerRef.current = null;
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (e) {
                // ignore
            }
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    return (
        <div className="space-y-5">
            {/* Scanner viewport */}
            <div className="qr-container">
                <div className="qr-frame">
                    <div
                        id="qr-reader"
                        ref={containerRef}
                        className="w-full"
                        style={{ minHeight: isScanning ? '320px' : '220px' }}
                    />

                    {!isScanning && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-cyber-bg/80">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-cyber-cyan/20 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-xl bg-cyber-cyan/5 flex items-center justify-center">
                                        <Camera className="w-8 h-8 text-cyber-cyan/50" />
                                    </div>
                                </div>
                            </div>
                            <div className="text-center px-6">
                                <p className="text-cyber-muted text-sm font-['Rajdhani'] font-medium">
                                    Point your camera at a Hub QR code
                                </p>
                                <p className="text-cyber-muted/50 text-xs font-['Share_Tech_Mono'] mt-1.5">
                                    Tap START SCANNER below to begin
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Scanning overlay with corner borders */}
                    {isScanning && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px]">
                                <div className="qr-corner qr-corner-tl" />
                                <div className="qr-corner qr-corner-tr" />
                                <div className="qr-corner qr-corner-bl" />
                                <div className="qr-corner qr-corner-br" />
                                <div className="qr-scan-line" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="alert-error">
                    <Smartphone className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Camera Error</p>
                        <p className="opacity-70 text-xs mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Toggle button */}
            <button
                onClick={isScanning ? stopScanner : startScanner}
                disabled={disabled}
                className={`btn-base btn-full ${isScanning ? 'cyber-btn-danger' : 'cyber-btn'}`}
            >
                {isScanning ? (
                    <>
                        <CameraOff className="w-5 h-5" />
                        STOP SCANNER
                    </>
                ) : (
                    <>
                        <Camera className="w-5 h-5" />
                        START SCANNER
                    </>
                )}
            </button>
        </div>
    );
}
