import { useEffect, useState } from "react";

/**
 * Hook to debounce a value.
 * @param {{value: unknown, delay: number}} param0
 * @param {unknown} param0.value The value to debounce
 * @param {number} param0.delay The delay in ms
 * @returns {unknown} The debounced value
 */
const useDebounce = ({ value, delay }: { value: unknown; delay: number }) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

export default useDebounce;
