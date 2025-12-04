import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { ACUnit } from './components/ACUnit';
import { RemoteControl } from './components/RemoteControl';
import { ACState, ACMode } from './types';
import { INITIAL_AC_STATE } from './constants';
import { interpretVoiceCommand } from './services/geminiService';
import { Thermometer, Droplets } from 'lucide-react';

const App: React.FC = () => {
  const [acState, setAcState] = useState<ACState>(INITIAL_AC_STATE);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Simulation Logic: Room Temperature Physics
  useEffect(() => {
    const interval = setInterval(() => {
      setAcState((prev) => {
        let newRoomTemp = prev.roomTemp;
        const target = prev.targetTemp;
        const outdoor = prev.outdoorTemp;

        if (prev.power) {
          // AC Logic
          const efficiency = prev.turboMode ? 0.4 : prev.ecoMode ? 0.1 : 0.2;
          
          if (prev.mode === ACMode.COOL && newRoomTemp > target) {
            newRoomTemp = Math.max(target, newRoomTemp - efficiency);
          } else if (prev.mode === ACMode.HEAT && newRoomTemp < target) {
            newRoomTemp = Math.min(target, newRoomTemp + efficiency);
          }
        } else {
          // Natural convection (return to outdoor temp slowly)
          const diff = outdoor - newRoomTemp;
          newRoomTemp += diff * 0.05; 
        }

        // Format to 1 decimal place
        return { ...prev, roomTemp: parseFloat(newRoomTemp.toFixed(1)) };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const updateState = useCallback((updates: Partial<ACState>) => {
    setAcState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleVoiceCommand = async (command: string) => {
    try {
      const response = await interpretVoiceCommand(command, acState);
      if (response.settings) {
        updateState(response.settings);
      }
      setAiMessage(response.reply);
      setTimeout(() => setAiMessage(null), 5000); // Clear message after 5s
    } catch (e) {
      console.error(e);
      setAiMessage("Sorry, I didn't catch that.");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 flex flex-col gap-6 max-w-5xl mx-auto">
      
      {/* Header Info Bar */}
      <div className="bg-white rounded-xl p-3 shadow-sm flex flex-wrap gap-4 items-center justify-between text-xs text-gray-600">
         <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-red-400" />
            <span className="font-semibold">Outdoor: {acState.outdoorTemp}°C</span>
         </div>
         <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-blue-400" />
            <span className="font-semibold">Room: {acState.roomTemp}°C</span>
         </div>
         <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-300" />
            <span className="font-semibold">Humidity: 55%</span>
         </div>
         <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${acState.airQuality < 50 ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="font-semibold">Air Quality: {acState.airQuality < 50 ? 'Excellent' : 'Moderate'}</span>
         </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Remote Control (Taking up 5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-start pt-4">
           <div className="sticky top-8 w-full max-w-sm">
             <div className="mb-3 text-center">
               <h2 className="text-xl font-bold text-gray-800 mb-1">Smart Control</h2>
             </div>
             <RemoteControl
               state={acState}
               onUpdate={updateState}
               onVoiceCommand={handleVoiceCommand}
             />
           </div>
        </div>

        {/* Right Column: Visual Unit & Stats (Taking up 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <ACUnit state={acState} />
        </div>

      </div>
    </div>
  );
};

export default App;