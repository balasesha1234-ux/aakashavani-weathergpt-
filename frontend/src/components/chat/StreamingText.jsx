import React, { useState, useEffect, useRef } from 'react';

/**
 * Format markdown inline elements safely and return styled spans.
 */
function FormattedMessageContent({ text }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, lIdx) => {
        if (!line.trim()) return <div key={lIdx} className="h-1.5" />;

        // Check for bullet points
        const isBullet = line.startsWith('• ') || line.startsWith('* ') || line.startsWith('- ');
        const cleanLine = isBullet ? line.slice(2) : line;

        // Parse bold **text**
        const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

        const renderedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.slice(2, -2);
            return (
              <strong key={pIdx} className="font-extrabold text-cyan-300 dark:text-cyan-400">
                {boldText}
              </strong>
            );
          }
          return <span key={pIdx}>{part}</span>;
        });

        if (isBullet) {
          return (
            <div key={lIdx} className="flex items-start gap-2 pl-2">
              <span className="text-cyan-400 font-bold">•</span>
              <div className="flex-1">{renderedLine}</div>
            </div>
          );
        }

        return <div key={lIdx}>{renderedLine}</div>;
      })}
    </div>
  );
}

export default function StreamingText({
  text = '',
  speed = 12,
  isNew = false,
  onComplete
}) {
  const [displayedLength, setDisplayedLength] = useState(isNew ? 0 : text.length);
  const [isTyping, setIsTyping] = useState(isNew);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isNew || !text) {
      setDisplayedLength(text.length);
      setIsTyping(false);
      onCompleteRef.current?.();
      return;
    }

    setDisplayedLength(0);
    setIsTyping(true);

    let currentIndex = 0;
    const totalLength = text.length;
    // Chunk size: 2-3 characters per step for ultra-smooth fast typing
    const step = 3;

    const interval = setInterval(() => {
      currentIndex += step;
      if (currentIndex >= totalLength) {
        setDisplayedLength(totalLength);
        setIsTyping(false);
        clearInterval(interval);
        onCompleteRef.current?.();
      } else {
        setDisplayedLength(currentIndex);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, isNew, speed]);

  const visibleText = text.slice(0, displayedLength);

  return (
    <div className="text-sm leading-relaxed font-medium">
      <FormattedMessageContent text={visibleText} />
      {isTyping && <span className="typing-cursor-glow" />}
    </div>
  );
}
