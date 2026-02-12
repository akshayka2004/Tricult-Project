import QRCode from 'qrcode';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const TOTAL_HUBS = 5;
const outputDir = resolve('hub-qr-codes');

// Ensure output directory exists
mkdirSync(outputDir, { recursive: true });

async function generateHubQRCodes() {
    console.log('Generating QR codes for', TOTAL_HUBS, 'hubs...\n');

    const qrDataUrls = [];

    for (let hub = 1; hub <= TOTAL_HUBS; hub++) {
        // Generate QR code as PNG file
        const filePath = resolve(outputDir, `hub-${hub}.png`);
        await QRCode.toFile(filePath, String(hub), {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        });

        // Also generate as data URL for the HTML page
        const dataUrl = await QRCode.toDataURL(String(hub), {
            width: 300,
            margin: 2,
        });
        qrDataUrls.push({ hub, dataUrl });

        console.log(`  ✓ Hub ${hub} → ${filePath}`);
    }

    // Generate a printable HTML page with all QR codes
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TRICULT — Hub QR Codes</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        h1 {
            text-align: center;
            font-size: 28px;
            margin-bottom: 10px;
            color: #1a1a2e;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 40px;
            font-size: 14px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            max-width: 900px;
            margin: 0 auto;
        }
        .card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            page-break-inside: avoid;
        }
        .card img {
            width: 200px;
            height: 200px;
            margin: 0 auto 20px;
            display: block;
        }
        .hub-label {
            font-size: 24px;
            font-weight: 800;
            color: #1a1a2e;
            margin-bottom: 5px;
        }
        .hub-instruction {
            font-size: 12px;
            color: #888;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            color: #aaa;
            font-size: 11px;
        }
        @media print {
            body { background: white; padding: 10px; }
            .grid { gap: 20px; }
            .card { border: 1px solid #ccc; }
        }
    </style>
</head>
<body>
    <h1>TRICULT — Hub QR Codes</h1>
    <p class="subtitle">Print this page and place one QR code at each gaming hub station</p>
    <div class="grid">
${qrDataUrls.map(({ hub, dataUrl }) => `
        <div class="card">
            <img src="${dataUrl}" alt="Hub ${hub} QR Code" />
            <div class="hub-label">HUB ${hub}</div>
            <div class="hub-instruction">Scan this code to start a session</div>
        </div>`).join('\n')}
    </div>
    <div class="footer">
        Each QR code contains just the hub number (${Array.from({ length: TOTAL_HUBS }, (_, i) => i + 1).join(', ')}). 
        The app reads this number and processes the session automatically.
    </div>
</body>
</html>`;

    const htmlPath = resolve(outputDir, 'print-all-hubs.html');
    writeFileSync(htmlPath, html);
    console.log(`\n  ✓ Printable page → ${htmlPath}`);

    console.log('\n═══════════════════════════════════════');
    console.log('  ALL DONE! Open print-all-hubs.html');
    console.log('  in your browser and press Ctrl+P');
    console.log('  to print all QR codes.');
    console.log('═══════════════════════════════════════\n');
}

generateHubQRCodes().catch(console.error);
