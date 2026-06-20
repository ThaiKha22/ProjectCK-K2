// hooks/useSearch.js
import { useState, useMemo } from 'react';

export function useSearch(items, fields) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(item =>
      fields.some(field => String(item[field] ?? '').toLowerCase().includes(q))
    );
  }, [items, query, fields]);

  return { query, setQuery, filtered };
}
