import QRCode from 'qrcode';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

// ─── Activity definitions (must match src/lib/constants.js) ───
const ACTIVITIES = [
    { id: 'rc_car', name: 'RC Car 3 Laps', amount: 199, duration_mins: null },
    { id: 'rc_excavator', name: 'RC Excavator', amount: 99, duration_mins: 5 },
    { id: 'deduct_30', name: 'Deduction 30', amount: 30, duration_mins: null },
    { id: 'deduct_50', name: 'Deduction 50', amount: 50, duration_mins: null },
    { id: 'deduct_100', name: 'Deduction 100', amount: 100, duration_mins: null },
    { id: 'deduct_120', name: 'Deduction 120', amount: 120, duration_mins: null },
    { id: 'deduct_150', name: 'Deduction 150', amount: 150, duration_mins: null },
    { id: 'deduct_180', name: 'Deduction 180', amount: 180, duration_mins: null },
    { id: 'vr_car', name: 'VR Car Station', amount: 250, duration_mins: 15 },
    { id: 'challenge', name: 'Challenge', amount: 100, duration_mins: null },
    { id: 'dummy', name: 'Dummy', amount: 200, duration_mins: 15 },
];

const outputDir = resolve('public', 'hub-qr-codes');

// Ensure output directory exists
mkdirSync(outputDir, { recursive: true });

async function generateActivityQRCodes() {
    console.log(`Generating QR codes for ${ACTIVITIES.length} activities...\n`);

    const qrDataUrls = [];

    for (const activity of ACTIVITIES) {
        // QR payload: JSON with activity details
        const payload = JSON.stringify({
            id: activity.id,
            name: activity.name,
            amount: activity.amount,
            duration_mins: activity.duration_mins,
        });

        // Generate QR code as PNG file
        const filePath = resolve(outputDir, `${activity.id}.png`);
        await QRCode.toFile(filePath, payload, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        });

        // Also generate as data URL for the HTML page
        const dataUrl = await QRCode.toDataURL(payload, {
            width: 300,
            margin: 2,
        });
        qrDataUrls.push({ activity, dataUrl });

        const durationLabel = activity.duration_mins ? `${activity.duration_mins} min` : 'Instant';
        console.log(`  ✓ ${activity.name} (₹${activity.amount}, ${durationLabel}) → ${filePath}`);
    }

    // Generate a printable HTML page with all QR codes
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TRICULT — Activity QR Codes</title>
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
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 30px;
            max-width: 1100px;
            margin: 0 auto;
        }
        .card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            page-break-inside: avoid;
        }
        .card.timed {
            border-color: #00cc88;
        }
        .card img {
            width: 200px;
            height: 200px;
            margin: 0 auto 16px;
            display: block;
        }
        .activity-name {
            font-size: 18px;
            font-weight: 800;
            color: #1a1a2e;
            margin-bottom: 6px;
        }
        .activity-amount {
            font-size: 24px;
            font-weight: 900;
            color: #ff3366;
            margin-bottom: 4px;
        }
        .activity-duration {
            font-size: 13px;
            color: #00aa66;
            font-weight: 600;
        }
        .activity-type {
            display: inline-block;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            padding: 3px 10px;
            border-radius: 20px;
            margin-top: 8px;
        }
        .type-timed {
            background: #e0fff0;
            color: #00aa66;
        }
        .type-instant {
            background: #fff0e0;
            color: #cc6600;
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
    <h1>TRICULT — Activity QR Codes</h1>
    <p class="subtitle">Print this page and place one QR code at each activity station</p>
    <div class="grid">
${qrDataUrls.map(({ activity, dataUrl }) => {
        const isTimed = activity.duration_mins !== null;
        return `
        <div class="card${isTimed ? ' timed' : ''}">
            <img src="${dataUrl}" alt="${activity.name} QR Code" />
            <div class="activity-name">${activity.name}</div>
            <div class="activity-amount">₹${activity.amount} TKN</div>
            ${isTimed ? `<div class="activity-duration">${activity.duration_mins} min session</div>` : ''}
            <span class="activity-type ${isTimed ? 'type-timed' : 'type-instant'}">${isTimed ? 'Timed Session' : 'Instant Deduction'}</span>
        </div>`;
    }).join('\n')}
    </div>
    <div class="footer">
        Each QR code contains JSON data with activity details.
        The app reads this data and processes the session/deduction automatically.
    </div>
</body>
</html>`;

    const htmlPath = resolve(outputDir, 'print-all-activities.html');
    writeFileSync(htmlPath, html);
    console.log(`\n  ✓ Printable page → ${htmlPath}`);

    console.log('\n═══════════════════════════════════════');
    console.log('  ALL DONE! Open print-all-activities.html');
    console.log('  in your browser and press Ctrl+P');
    console.log('  to print all QR codes.');
    console.log('═══════════════════════════════════════\n');
}

generateActivityQRCodes().catch(console.error);
