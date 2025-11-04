import { useEffect, useState } from "react";

/**
 * Trả về giá trị sau khi "im lặng" trong delay ms.
 * Dùng: const debouncedQ = useDebounce(q, 350)
 */
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
