import { useState } from 'react';
import { motion } from 'framer-motion';

type SearchBarProps = {
  onSearch: (query: string) => Promise<string>; // parent will handle searching
  loaderMessages?: string[];
};

export function SearchBar({
  onSearch,
  loaderMessages = [
    "Searching in web…",
    "Querying database…",
    "Generating answer…"
  ]
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const handleSearch = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    let msgIndex = 0;
    const messageInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loaderMessages.length;
      setCurrentMessageIndex(msgIndex);
    }, 1500);

    try {
      const res = await onSearch(query);
      setResult(res);
    } catch (e) {
      setError('Something went wrong');
    } finally {
      clearInterval(messageInterval);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-md w-full max-w-xl">
      <div className="flex space-x-2">
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Type your question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white rounded px-4 py-1"
          onClick={handleSearch}
          disabled={loading}
        >
          Search
        </button>
      </div>

      {loading && (
        <motion.div
          className="mt-4 text-gray-600"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {loaderMessages[currentMessageIndex]}
        </motion.div>
      )}

      {result && (
        <div className="mt-4 text-green-600">{result}</div>
      )}

      {error && (
        <div className="mt-4 text-red-600">{error}</div>
      )}
    </div>
  );
}
