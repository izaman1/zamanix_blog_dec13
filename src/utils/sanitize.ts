const allowedTags = [
  'p', 'h1', 'h2', 'h3',
  'strong', 'em', 'u',
  'br', 'div', 'span'
];

const allowedAttributes = {
  '*': ['style', 'class']
};

const allowedStyles = {
  '*': {
    'text-align': [/^left$/, /^right$/, /^center$/],
    'font-size': [/.*/]
  }
};

export const sanitizeContent = (content: string): string => {
  // Basic HTML sanitization
  const clean = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Keep only allowed tags and attributes
  return clean.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (tag, name) => {
    if (!allowedTags.includes(name.toLowerCase())) {
      return '';
    }
    return tag;
  });
};