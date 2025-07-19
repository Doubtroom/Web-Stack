import React,{useEffect} from "react";
import { Sparkles } from "lucide-react";
import PointsTooltip from "./PointsTooltip";
import { useDispatch, useSelector } from "react-redux";
import { fetchStarDustInfo } from "../store/starDustSlice";

// Custom hook to detect desktop with hover support
function useIsDesktopWithHover() {
  const [isDesktop, setIsDesktop] = React.useState(true);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setIsDesktop(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    }
  }, []);
  return isDesktop;
}

const PointsButton = () => {
  const dispatch = useDispatch();
  const { points, transactions, loading } = useSelector(state => state.starDust);
  useEffect(() => {
    dispatch(fetchStarDustInfo());
  }, [dispatch]);
  const isDesktop = useIsDesktopWithHover();

  // Button content
  const buttonContent = (
    <div
      className="relative flex items-center justify-center gap-0.5 px-1.5 py-0.5 min-w-[68px] rounded-full border-2 border-transparent ring-2 ring-[#4485CE] shadow-[0_0_12px_4px_rgba(68,133,206,0.13)] bg-white dark:bg-black-radial transition-transform duration-200 ease-out overflow-hidden hover:scale-105 hover:shadow-[0_0_24px_8px_rgba(68,133,206,0.18)] sm:gap-1 sm:px-2 sm:min-w-[92px] sm:shadow-[0_0_16px_6px_rgba(68,133,206,0.18)] sm:hover:shadow-[0_0_32px_12px_rgba(68,133,206,0.25)]"
    >
      <div className="flex items-center justify-center gap-0.5 sm:gap-1">
        {/* Blurry blue glow behind the icon */}
        <span className="absolute -inset-1 rounded-full blur-lg bg-[radial-gradient(circle,_rgba(68,133,206,0.13)_0%,_transparent_70%)] z-[-1]" />
        <Sparkles
          className="w-4 h-4 text-[#4485CE] drop-shadow-[0_0_4px_rgba(68,133,206,0.7)] sm:w-5 sm:h-5 sm:drop-shadow-[0_0_6px_rgba(68,133,206,0.7)]"
        />
        <span className="text-sm font-semibold dark:text-gray-100 text-slate-800 drop-shadow-[0_0_2px_rgba(68,133,206,0.3)] sm:text-base">
          {loading ? "..." : points}
        </span>
        <span className="text-[9px] leading-tight text-gray-400 dark:text-gray-500 font-medium ml-0.5 sm:text-[10px] sm:ml-1">
          SDP
        </span>
      </div>
    </div>
  );

  return (
    <PointsTooltip points={points} transactions={transactions} onlyClick={!isDesktop}>
      {buttonContent}
    </PointsTooltip>
  );
};

export default PointsButton; 