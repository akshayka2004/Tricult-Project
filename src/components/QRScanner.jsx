import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, Smartphone, AlertTriangle } from 'lucide-react';

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
                    qrbox: { width: 250, height: 250 },
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
            setError('Camera access denied. Please allow permissions.');
            scannerRef.current = null;
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (e) { /* ignore */ }
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    useEffect(() => {
        return () => { stopScanner(); };
    }, []);

    // ─── Inline Styles ───
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
        },
        qrWrapper: {
            position: 'relative',
            background: 'rgba(10, 10, 26, 0.6)',
            border: '1px solid rgba(42, 42, 94, 0.5)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)',
        },
        reader: {
            width: '100%',
            minHeight: isScanning ? '320px' : '280px',
            borderRadius: '24px',
        },
        overlay: {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(5, 5, 10, 0.85)',
            backdropFilter: 'blur(8px)',
            gap: '20px',
        },
        iconCircle: {
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(0, 255, 255, 0.05)',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.1)',
        },
        text: {
            fontFamily: "'Rajdhani', sans-serif",
            color: '#8888aa',
            fontSize: '14px',
            fontWeight: 500,
        },
        subText: {
            fontFamily: "'Share_Tech_Mono', monospace",
            color: 'rgba(136, 136, 170, 0.5)',
            fontSize: '11px',
            marginTop: '6px',
        },
        button: {
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: '1px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s ease',
            background: isScanning
                ? 'linear-gradient(90deg, rgba(255, 0, 85, 0.1) 0%, rgba(255, 0, 85, 0.2) 100%)'
                : 'linear-gradient(90deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 255, 255, 0.2) 100%)',
            color: isScanning ? '#ff0055' : '#00ffff',
            border: isScanning ? '1px solid rgba(255, 0, 85, 0.3)' : '1px solid rgba(0, 255, 255, 0.3)',
            boxShadow: isScanning ? '0 0 15px rgba(255, 0, 85, 0.2)' : '0 0 15px rgba(0, 255, 255, 0.2)',
        },
        errorBox: {
            background: 'rgba(255, 0, 85, 0.1)',
            border: '1px solid rgba(255, 0, 85, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#ff0055',
        },
        // Scanner Overlay (Corners + Line)
        scanOverlay: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '240px',
            height: '240px',
            pointerEvents: 'none',
        },
        corner: (pos) => ({
            position: 'absolute',
            width: '40px',
            height: '40px',
            borderColor: '#00ffff',
            borderStyle: 'solid',
            borderWidth: '0',
            ...pos, // e.g., { top: 0, left: 0, borderTopWidth: '3px', borderLeftWidth: '3px' }
            filter: 'drop-shadow(0 0 5px #00ffff)',
        }),
        scanLine: {
            position: 'absolute',
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
            boxShadow: '0 0 10px #00ffff',
            animation: 'scanAnimation 2s linear infinite',
        }
    };

    // Add keyframes to document head if needed (or assume index.css handles standard animations, 
    // but better to inject style tag for specific inline animation).
    // For now, I'll rely on a style tag injection or assume 'scanAnimation' is not defined?
    // I should add the keyframes.
    useEffect(() => {
        if (!document.getElementById('scan-keyframes')) {
            const style = document.createElement('style');
            style.id = 'scan-keyframes';
            style.innerHTML = `
                @keyframes scanAnimation {
                    0% { top: 0; opacity: 0; }
                    5% { opacity: 1; }
                    95% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    return (
        <div style={styles.container}>
            {/* Scanner Viewport */}
            <div style={styles.qrWrapper}>
                <div id="qr-reader" ref={containerRef} style={styles.reader} />

                {!isScanning && (
                    <div style={styles.overlay}>
                        <div style={styles.iconCircle}>
                            <Camera style={{ width: 32, height: 32, color: 'rgba(0, 255, 255, 0.6)' }} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={styles.text}>Connect to Hub Network</p>
                            <p style={styles.subText}>Ready to initiate sequence</p>
                        </div>
                    </div>
                )}

                {isScanning && (
                    <div style={styles.scanOverlay}>
                        <div style={styles.corner({ top: 0, left: 0, borderTopWidth: '3px', borderLeftWidth: '3px', borderTopLeftRadius: '12px' })} />
                        <div style={styles.corner({ top: 0, right: 0, borderTopWidth: '3px', borderRightWidth: '3px', borderTopRightRadius: '12px' })} />
                        <div style={styles.corner({ bottom: 0, left: 0, borderBottomWidth: '3px', borderLeftWidth: '3px', borderBottomLeftRadius: '12px' })} />
                        <div style={styles.corner({ bottom: 0, right: 0, borderBottomWidth: '3px', borderRightWidth: '3px', borderBottomRightRadius: '12px' })} />
                        <div style={styles.scanLine} />
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div style={styles.errorBox}>
                    <AlertTriangle style={{ width: 20, height: 20 }} />
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{error}</span>
                </div>
            )}

            {/* Main Action Button */}
            <button
                onClick={isScanning ? stopScanner : startScanner}
                disabled={disabled}
                style={styles.button}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = isScanning ? '0 0 25px rgba(255, 0, 85, 0.4)' : '0 0 25px rgba(0, 255, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isScanning ? '0 0 15px rgba(255, 0, 85, 0.2)' : '0 0 15px rgba(0, 255, 255, 0.2)';
                }}
            >
                {isScanning ? (
                    <>
                        <CameraOff style={{ width: 20, height: 20 }} />
                        TERMINATE SCAN
                    </>
                ) : (
                    <>
                        <Camera style={{ width: 20, height: 20 }} />
                        ACTIVATE SCANNER
                    </>
                )}
            </button>
        </div>
    );
}
