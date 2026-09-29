'use client';

import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  words,
  typingSpeed = 90,
  deletingSpeed = 45,
  pauseDuration = 2200,
  className = '',
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const targetWord = words[wordIndex % words.length];

    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          const nextText = targetWord.slice(0, currentText.length + 1);
          setCurrentText(nextText);

          if (nextText === targetWord) {
            setTimeout(() => setIsDeleting(true), pauseDuration);
          }
        } else {
          const nextText = targetWord.slice(0, currentText.length - 1);
          setCurrentText(nextText);

          if (nextText === '') {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className="inline-inline-flex items-center">
      <span className={className}>{currentText}</span>
      <span className="animate-pulse font-normal text-indigo-400 ml-0.5">|</span>
    </span>
  );
};
