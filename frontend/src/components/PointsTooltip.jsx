import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const PointsTooltip = ({ points, transactions, children, onlyClick }) => {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const closeTimer = useRef();

  // Hide tooltip on outside click/tap
  useEffect(() => {
    if (!visible) return;
    function handleClick(e) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [visible]);

  // Hover/focus logic (desktop only, with timer)
  const handleMouseEnter = () => {
    if (!onlyClick) {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setVisible(true);
    }
  };
  const handleMouseLeave = () => {
    if (!onlyClick) {
      closeTimer.current = setTimeout(() => {
        setVisible(false);
      }, 120);
    }
  };
  const handleTooltipMouseEnter = handleMouseEnter;
  const handleTooltipMouseLeave = handleMouseLeave;
  const handleFocus = () => !onlyClick && setVisible(true);
  const handleBlur = () => !onlyClick && setVisible(false);

  // Toggle on click, but prevent navigation
  const handleClick = (e) => {
    e.preventDefault();
    setVisible((v) => !v);
  };

  const baseTooltip =
    "z-50 absolute top-full left-1/2 -translate-x-1/2 mt-2.5 min-w-[220px] bg-white dark:bg-black border border-[#4485CE] rounded-xl shadow-lg px-4 py-3 text-[#232946] dark:text-white transition-all duration-200 ease-out";
  const showAnim = "opacity-100 scale-100 pointer-events-auto";
  const hideAnim = "opacity-0 scale-95 pointer-events-none";

  return (
    <div className="relative flex flex-col items-center">
      <div
        ref={triggerRef}
        onClick={handleClick}
        onMouseEnter={!onlyClick ? handleMouseEnter : undefined}
        onMouseLeave={!onlyClick ? handleMouseLeave : undefined}
        onFocus={!onlyClick ? handleFocus : undefined}
        onBlur={!onlyClick ? handleBlur : undefined}
        tabIndex={0}
        className="outline-none"
        role="button"
        aria-haspopup="true"
        aria-expanded={visible}
      >
        {children}
      </div>
      <div
        ref={tooltipRef}
        onMouseEnter={!onlyClick ? handleTooltipMouseEnter : undefined}
        onMouseLeave={!onlyClick ? handleTooltipMouseLeave : undefined}
        className={
          baseTooltip +
          " " +
          (visible ? showAnim : hideAnim)
        }
        style={{ fontFamily: 'Kanit, Josefin Sans, sans-serif' }}
      >
        {/* Small Arrow */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 overflow-hidden">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <polygon points="8,16 0,0 16,0" fill="white" className="dark:fill-black" stroke="#4485CE" strokeWidth="1" />
          </svg>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-[#4485CE]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l-1.414-1.414M6.05 6.05L4.636 4.636"/><circle cx="12" cy="12" r="5"/></svg>
          <span className="font-bold text-lg text-[#4485CE] tracking-wide"> <span className="font-bold text-xl text-black  dark:text-white tracking-wide">{points}</span> Star Dust Points</span>
        </div>
        <div className="text-sm dark:text-white text-[#232946] mb-1 font-semibold tracking-wide">Recent Transactions:</div>
        <ul className="text-xs dark:text-white text-[#232946] space-y-1 mb-3">
          {transactions.map((tx, idx) => (
            <li key={idx} className="flex justify-between items-center">
              <span>{tx.desc}</span>
              <span className={tx.amount > 0 ? 'text-green-500 font-bold' : 'text-red-400 font-bold'}>
                {tx.amount > 0 ? '+' : ''}{tx.amount}
              </span>
            </li>
          ))}
        </ul>
        <Link to="/redeem">
          <button className="w-full mt-1 py-1 rounded-lg bg-[#4485CE] text-white font-semibold text-sm hover:bg-[#356bb0] transition-colors duration-150">Redeem</button>
        </Link>
      </div>
    </div>
  );
};

export default PointsTooltip; 