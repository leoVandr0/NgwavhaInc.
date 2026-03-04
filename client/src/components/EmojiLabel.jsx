import React from 'react';
import { emojiFor } from '../utils/emoji.js';

export default function EmojiLabel({ label, kind }) {
  return (
    <span role="img" aria-label={label} className="emoji">
      {emojiFor(kind)}
    </span>
  );
}
