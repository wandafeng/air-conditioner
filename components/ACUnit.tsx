import React, { useEffect, useState } from 'react';
import { ACState, ACMode } from '../types';
import { MODE_COLORS } from '../constants';
import { Wind, Droplets, Sun, Snowflake, Zap, Leaf } from 'lucide-react';

interface ACUnitProps {
  state: ACState;
}

export const ACUnit: React.FC<ACUnitProps> = ({ state }) => {
  const [bladeAngle, setBladeAngle] = useState(0);

  // Simulate louver movement
  useEffect(() => {
    if (!state.power) {
      setBladeAngle(0); // Closed
      return;
    }

    if (state.swingVertical) {
      const interval = setInterval(() => {
        setBladeAngle((prev) => (prev === 45 ? 10 : 45)); // Simple toggle for animation
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setBladeAngle(35); // Open fixed position
    }
  }, [state.power, state.swingVertical]);

  const getModeIcon = () => {
    switch (state.mode) {
      case ACMode.COOL: return <Snowflake className="w-5 h-5 text-blue-200 animate-pulse" />;
      case ACMode.HEAT: return <Sun className="w-5 h-5 text-orange-200 animate-pulse" />;
      case ACMode.DRY: return <Droplets className="w-5 h-5 text-purple-200" />;
      case ACMode.FAN: return <Wind className="w-5 h-5 text-green-200 animate-spin-slow" />;
      case ACMode.AUTO: return <Zap className="w-5 h-5 text-white" />;
      default: return null;
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto my-8 perspective-1000">
      {/* Wall shadow */}
      <div className="absolute top-4 left-4 right-[-10px] bottom-[-20px] bg-black/10 blur-xl rounded-2xl" />

      {/* Main Body */}
      <div className={`relative bg-gradient-to-b from-white to-gray-100 rounded-3xl shadow-2xl border border-gray-200 transition-all duration-700 ${state.power ? 'shadow-blue-500/10' : ''}`}>
        
        {/* Top Curve Highlight */}
        <div className="h-16 bg-gradient-to-b from-white to-transparent rounded-t-3xl opacity-80" />

        {/* Display Panel */}
        <div className="absolute top-6 right-8 w-48 h-12 bg-black/80 rounded-lg flex items-center justify-end px-4 gap-3 border border-gray-700 shadow-inner overflow-hidden">
          {!state.power ? (
             <span className="text-gray-600 text-xs digital-font">OFF</span>
          ) : (
            <>
              {/* Icons */}
              <div className="flex gap-2">
                {state.ecoMode && <Leaf className="w-3 h-3 text-green-400" />}
                {state.sleepMode && <span className="text-xs text-indigo-300">☾</span>}
                {getModeIcon()}
              </div>
              
              {/* Divider */}
              <div className="h-6 w-[1px] bg-gray-600 mx-1" />

              {/* Temperature */}
              <div className="flex items-baseline">
                <span className="digital-font text-3xl text-white font-bold tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                  {state.targetTemp}
                </span>
                <span className="text-xs text-gray-300 ml-1">°C</span>
              </div>
            </>
          )}
        </div>

        {/* Brand Logo Mock */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
           <span className="text-gray-300 font-bold italic tracking-wider text-lg">GEMINI AIR</span>
        </div>

        {/* Air Outlet / Louvers */}
        <div className="mt-24 h-24 bg-gray-900 mx-4 mb-4 rounded-b-2xl relative overflow-hidden shadow-inner border-t border-gray-300">
           {/* Inner Fan Grid (Decoration) */}
           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMjIyIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMzMzMiLz4KPC9zdmc+')] opacity-50" />
           
           {/* Horizontal Blade (Main Swing) */}
           <div 
             className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-200 to-gray-400 origin-top transition-transform duration-1000 ease-in-out border-b border-gray-500 shadow-md z-10"
             style={{ 
               transform: `rotateX(-${state.power ? bladeAngle : 0}deg)`,
               transformOrigin: 'top' 
             }}
           >
             <div className="w-full h-full flex justify-center items-end pb-1">
                <span className="text-[10px] text-gray-500 tracking-[1em] uppercase">Dual Cool Inverter</span>
             </div>
           </div>

           {/* Vertical Blades (Internal) - visible when main blade opens */}
           {state.power && bladeAngle > 10 && (
             <div className="absolute top-4 left-10 right-10 flex justify-between px-10">
                {[1,2,3,4,5,6].map(i => (
                  <div 
                    key={i} 
                    className={`w-4 h-12 bg-gray-700 rounded transition-transform duration-[2000ms] ${state.swingHorizontal ? 'animate-pulse' : ''}`}
                    style={{ transform: state.swingHorizontal ? `rotateY(${i % 2 === 0 ? 30 : -30}deg)` : 'rotateY(0deg)' }}
                  />
                ))}
             </div>
           )}
        </div>

        {/* Status LED Indicators (Hidden when off usually, but for UI we show) */}
        <div className="absolute bottom-6 right-8 flex gap-3">
             <div className={`w-1.5 h-1.5 rounded-full ${state.power ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-gray-300'}`} />
             <div className={`w-1.5 h-1.5 rounded-full ${state.timer ? 'bg-orange-500 shadow-[0_0_5px_#f97316]' : 'bg-gray-300'}`} />
             <div className={`w-1.5 h-1.5 rounded-full ${state.isCleaning ? 'bg-blue-500 shadow-[0_0_5px_#3b82f6]' : 'bg-gray-300'}`} />
        </div>

      </div>

      {/* Visual Air Flow Simulation (Particles) */}
      {state.power && state.mode !== ACMode.HEAT && (
        <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 w-3/4 h-20 overflow-hidden pointer-events-none">
          <div className="w-full h-full bg-gradient-to-b from-blue-400/20 to-transparent animate-pulse blur-xl" />
        </div>
      )}
    </div>
  );
};
