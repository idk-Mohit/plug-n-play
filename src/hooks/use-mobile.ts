import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Checks if the current device is a mobile device.
 * This is based on the width of the viewport.
 * If the width is less than 768px, the device is considered a mobile device.
 * @returns boolean indicating if the device is a mobile device
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
