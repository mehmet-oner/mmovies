import React, { useState } from "react";

const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(false);
  // Only run on client
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width:${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return isMobile;
};

export default useIsMobile;
