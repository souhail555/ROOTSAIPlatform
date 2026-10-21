/**
 * Intelligent Twitter/X Thread Splitter and Formatter
 * Organizes long text (>280 chars) into a cohesive, sequential thread (1/N, 2/N...)
 */

export function splitTextIntoTwitterThread(text: string, maxCharsPerTweet: number = 260): string[] {
  if (!text || !text.trim()) return [];
  const clean = text.trim();

  // If already under standard limit, return single tweet
  if (clean.length <= 280) {
    return [clean];
  }

  // Split into paragraphs first to keep logical context
  const paragraphs = clean.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const rawChunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    // If paragraph fits into current chunk
    const candidate = current ? `${current}\n\n${para}` : para;
    if (candidate.length <= maxCharsPerTweet) {
      current = candidate;
    } else {
      if (current) {
        rawChunks.push(current);
        current = '';
      }

      // If single paragraph is longer than maxCharsPerTweet, split by sentence endings
      if (para.length > maxCharsPerTweet) {
        // Regex splits preserving sentence delimiters
        const sentences = para.split(/([.!؟؛\n]+|[\.\?\!]\s+)/).filter(Boolean);
        let sentenceBuffer = '';

        for (let i = 0; i < sentences.length; i++) {
          const piece = sentences[i];
          if ((sentenceBuffer + piece).length <= maxCharsPerTweet) {
            sentenceBuffer += piece;
          } else {
            if (sentenceBuffer.trim()) {
              rawChunks.push(sentenceBuffer.trim());
              sentenceBuffer = '';
            }

            // If a single sentence exceeds limit, split by words
            if (piece.length > maxCharsPerTweet) {
              const words = piece.split(/\s+/).filter(Boolean);
              let wordBuffer = '';
              for (const word of words) {
                if ((wordBuffer + ' ' + word).trim().length <= maxCharsPerTweet) {
                  wordBuffer = wordBuffer ? `${wordBuffer} ${word}` : word;
                } else {
                  if (wordBuffer.trim()) rawChunks.push(wordBuffer.trim());
                  wordBuffer = word;
                }
              }
              if (wordBuffer.trim()) sentenceBuffer = wordBuffer.trim();
            } else {
              sentenceBuffer = piece;
            }
          }
        }

        if (sentenceBuffer.trim()) {
          current = sentenceBuffer.trim();
        }
      } else {
        current = para;
      }
    }
  }

  if (current.trim()) {
    rawChunks.push(current.trim());
  }

  const total = rawChunks.length;
  if (total <= 1) return rawChunks;

  // Format with thread headers (e.g. 1/4 🧵, 2/4...)
  return rawChunks.map((chunk, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === total - 1;
    const numHeader = `[${idx + 1}/${total}]${isFirst ? ' 🧵' : ''}`;
    const footer = isLast ? '\n\n🌿 تابعوا حسابنا للمزيد: @ROOTS_AI_HEALTH' : '';
    return `${numHeader}\n${chunk}${footer}`;
  });
}
