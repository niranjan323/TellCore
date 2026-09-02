/**
 * Renders a story as a beautiful 1080×1350 (4:5) shareable card on a canvas —
 * no libraries, just fonts we already load (Lora / Nunito / Caveat).
 * Every shared card carries the TheUntold wordmark: the card IS the marketing.
 */
import type { Story } from '../../types/contracts';

export interface CardTemplate {
  key: string;
  name: string;
  /** page background */
  bg: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  ink: string;        // main text
  soft: string;       // secondary text
  accent: string;     // rules/flourishes
  wordmark: string;
}

const W = 1080;
const H = 1350;

function solid(color: string) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
  };
}

function warmGradient(from: string, to: string) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const g = ctx.createLinearGradient(0, 0, w * 0.4, h);
    g.addColorStop(0, from);
    g.addColorStop(1, to);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };
}

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    key: 'warm-paper',
    name: 'Warm paper',
    bg: solid('#fdfaf6'),
    ink: '#2b2421',
    soft: '#5c534d',
    accent: '#c08552',
    wordmark: '#a59a92',
  },
  {
    key: 'ink',
    name: 'Ink',
    bg: warmGradient('#2b2421', '#1c1714'),
    ink: '#fdfaf6',
    soft: '#c9beb4',
    accent: '#d4a574',
    wordmark: '#8a7f76',
  },
  {
    key: 'gold',
    name: 'Golden hour',
    bg: warmGradient('#f5e8dc', '#e9c9a3'),
    ink: '#5a3d22',
    soft: '#7a5c3d',
    accent: '#b0762f',
    wordmark: '#9a7c55',
  },
  {
    key: 'postcard',
    name: 'Postcard',
    bg: (ctx, w, h) => {
      solid('#f5f0e8')(ctx, w, h);
      ctx.strokeStyle = '#c08552';
      ctx.lineWidth = 3;
      ctx.setLineDash([18, 12]);
      ctx.strokeRect(42, 42, w - 84, h - 84);
      ctx.setLineDash([]);
    },
    ink: '#2b2421',
    soft: '#5c534d',
    accent: '#c08552',
    wordmark: '#a59a92',
  },
];

/** Grainy paper texture — subtle random dots. */
function grain(ctx: CanvasRenderingContext2D, tint: string) {
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.fillStyle = tint;
  for (let i = 0; i < 2600; i++) {
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
  maxLines: number,
): number {
  const shown = lines.slice(0, maxLines);
  if (lines.length > maxLines && shown.length > 0) {
    shown[shown.length - 1] = shown[shown.length - 1].replace(/\s*\S*$/, '') + ' …';
  }
  shown.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return y + shown.length * lineHeight;
}

export async function renderStoryCard(story: Story, template: CardTemplate): Promise<Blob> {
  // Make sure the display fonts are actually loaded before drawing.
  await Promise.all([
    document.fonts.load('600 66px Lora'),
    document.fonts.load('400 40px Lora'),
    document.fonts.load('600 34px Nunito'),
    document.fonts.load('400 44px Caveat'),
  ]).catch(() => undefined);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');

  template.bg(ctx, W, H);
  grain(ctx, template.ink);

  const margin = 108;
  const textWidth = W - margin * 2;
  let y = 210;

  // Handwritten kicker with the date
  ctx.fillStyle = template.accent;
  ctx.font = '400 44px Caveat, cursive';
  const dateLabel = new Date(story.createdAt).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  ctx.fillText(dateLabel, margin, y);
  y += 96;

  // Title (serif, large)
  ctx.fillStyle = template.ink;
  ctx.font = '600 66px Lora, serif';
  y = drawLines(ctx, wrapText(ctx, story.title, textWidth), margin, y, 84, 3);
  y += 30;

  // Accent rule
  ctx.strokeStyle = template.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(margin, y);
  ctx.lineTo(margin + 130, y);
  ctx.stroke();
  y += 74;

  // Body excerpt (serif reading text)
  const passage = (story.summary || story.body || story.excerpt || '')
    .replaceAll('\n', ' ')
    .trim();
  ctx.fillStyle = template.soft;
  ctx.font = '400 40px Lora, serif';
  y = drawLines(ctx, wrapText(ctx, passage, textWidth), margin, y, 62, 9);

  // Author (bottom-anchored)
  ctx.fillStyle = template.ink;
  ctx.font = '600 34px Nunito, sans-serif';
  ctx.fillText(`— ${story.author.name}`, margin, H - 168);

  // Wordmark
  ctx.fillStyle = template.wordmark;
  ctx.font = '600 30px Nunito, sans-serif';
  ctx.fillText('TheUntold', margin, H - 96);
  ctx.font = '400 30px Caveat, cursive';
  ctx.fillStyle = template.accent;
  ctx.fillText('every life has a story worth keeping', margin + 178, H - 96);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/png',
    );
  });
}
