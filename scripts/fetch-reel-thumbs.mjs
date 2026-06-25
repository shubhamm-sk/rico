import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const reels = [
  { id: 1, url: 'https://www.instagram.com/reel/DSJleEyCD1o/' },
  { id: 2, url: 'https://www.instagram.com/reel/DTuMFH9CEMy/' },
  { id: 3, url: 'https://www.instagram.com/reel/DO-4IRikgt2/' },
  { id: 4, url: 'https://www.instagram.com/reel/DXHJo8zEdWy/' },
  { id: 5, url: 'https://www.instagram.com/reel/DVnD9r3EeNx/' },
  { id: 6, url: 'https://www.instagram.com/reel/DUM9sFAiLYa/' },
  { id: 7, url: 'https://www.instagram.com/reel/DTffFwkiHeh/' },
  { id: 8, url: 'https://www.instagram.com/reel/DSFLWd3EzG2/' },
];

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'assets/images/reel-thumbs');
mkdirSync(outDir, { recursive: true });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function extractOgImage(html) {
  const match = html.match(/property="og:image" content="([^"]+)"/);
  if (!match) return null;
  return match[1].replace(/&amp;/g, '&');
}

for (const reel of reels) {
  const dest = join(outDir, `reel-${reel.id}-thumb.jpg`);
  try {
    const pageRes = await fetch(reel.url, { headers: { 'User-Agent': UA } });
    const html = await pageRes.text();
    const imageUrl = extractOgImage(html);
    if (!imageUrl) {
      console.log(`reel-${reel.id}: no og:image`);
      continue;
    }
    const imgRes = await fetch(imageUrl, { headers: { 'User-Agent': UA, Referer: 'https://www.instagram.com/' } });
    if (!imgRes.ok) {
      console.log(`reel-${reel.id}: image fetch ${imgRes.status}`);
      continue;
    }
    const buf = Buffer.from(await imgRes.arrayBuffer());
    writeFileSync(dest, buf);
    console.log(`reel-${reel.id}: saved ${buf.length} bytes`);
  } catch (err) {
    console.log(`reel-${reel.id}: ${err.message}`);
  }
  await new Promise((r) => setTimeout(r, 600));
}
