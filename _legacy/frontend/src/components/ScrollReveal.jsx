import { useEffect, useRef, useState } from "react";

export const ScrollReveal = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setRevealed(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${revealed ? "revealed" : ""} ${className}`}>
      {children}
    </div>
  );
};

export default ScrollReveal;
