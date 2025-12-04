import React, { useState } from 'react';
import { ACState, ACMode, FanSpeed } from '../types';
import {
  Power, Plus, Minus, Wind, ThermometerSun,
  Clock, Moon, Leaf, Fan, Grip,
  MoveVertical, MoveHorizontal, Mic, Activity,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { interpretVoiceCommand } from '../services/geminiService';

interface RemoteControlProps {
  state: ACState;
  onUpdate: (updates: Partial<ACState>) => void;
  onVoiceCommand: (text: string) => void;
}

export const RemoteControl: React.FC<RemoteControlProps> = ({ state, onUpdate, onVoiceCommand }) => {
  const [voiceInput, setVoiceInput] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const togglePower = () => onUpdate({ power: !state.power });
  
  const adjustTemp = (delta: number) => {
    if (!state.power) return;
    const newTemp = Math.min(30, Math.max(16, state.targetTemp + delta));
    onUpdate({ targetTemp: newTemp });
  };

  const cycleMode = () => {
    if (!state.power) return;
    const modes = Object.values(ACMode);
    const currentIndex = modes.indexOf(state.mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    onUpdate({ mode: nextMode });
  };

  const cycleFan = () => {
    if (!state.power) return;
    const speeds = Object.values(FanSpeed);
    const currentIndex = speeds.indexOf(state.fanSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    onUpdate({ fanSpeed: nextSpeed });
  };

  const handleVoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceInput.trim()) return;
    
    setIsProcessingVoice(true);
    // Call the parent handler which triggers the API
    await onVoiceCommand(voiceInput);
    setVoiceInput('');
    setIsProcessingVoice(false);
  };

  return (
    <div className="bg-gray-100 rounded-[3rem] p-6 shadow-xl border-4 border-white max-w-sm mx-auto relative">
       {/* IR Blaster styling */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/80 rounded-b-xl" />

       {/* Remote Screen */}
       <div className="bg-[#e6f4f1] rounded-xl p-4 mb-6 shadow-inner border border-gray-300 h-40 relative overflow-hidden">
          <div className="absolute top-2 left-3 text-[10px] font-bold text-gray-400">REMOTE</div>
          
          {state.power ? (
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Mode</span>
                    <span className="font-bold text-sm text-gray-800">{state.mode}</span>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Fan</span>
                    <div className="flex gap-0.5 mt-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`w-1 h-3 rounded-sm ${
                          state.fanSpeed === FanSpeed.AUTO ? 'bg-gray-400' :
                          Object.values(FanSpeed).indexOf(state.fanSpeed) >= i ? 'bg-black' : 'bg-gray-200'
                        }`} />
                      ))}
                    </div>
                 </div>
              </div>

              <div className="flex justify-center items-end py-2">
                 <span className="digital-font text-5xl text-gray-800 font-bold">{state.targetTemp}</span>
                 <span className="text-xl text-gray-600 mb-1">°C</span>
              </div>

              <div className="flex justify-between text-[10px] text-gray-600 font-medium px-1">
                 <div className="flex gap-2">
                    {state.swingVertical && <span>V-SWING</span>}
                    {state.swingHorizontal && <span>H-SWING</span>}
                 </div>
                 <div className="flex gap-2">
                    {state.ecoMode && <span>ECO</span>}
                    {state.sleepMode && <span>SLEEP</span>}
                 </div>
              </div>
            </div>
          ) : (
             <div className="h-full flex items-center justify-center">
                <span className="text-gray-400 font-medium">OFF</span>
             </div>
          )}
       </div>

       {/* Main Controls Grid */}
       <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Power Button */}
          <button 
            onClick={togglePower}
            className={`col-span-1 aspect-square rounded-full flex items-center justify-center shadow-lg active:shadow-inner transition-all ${state.power ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
          >
            <Power className="w-6 h-6" />
          </button>

          {/* Temp Control */}
          <div className="col-span-2 bg-gray-200 rounded-full flex items-center justify-between p-2 shadow-inner">
             <button onClick={() => adjustTemp(-1)} className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center active:scale-95 transition-transform">
                <ChevronDown className="w-5 h-5 text-gray-600" />
             </button>
             <span className="text-sm font-bold text-gray-500 uppercase">Temp</span>
             <button onClick={() => adjustTemp(1)} className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center active:scale-95 transition-transform">
                <ChevronUp className="w-5 h-5 text-gray-600" />
             </button>
          </div>

          {/* Mode */}
          <button onClick={cycleMode} className="aspect-square bg-white rounded-2xl shadow-md flex flex-col items-center justify-center gap-1 active:bg-gray-50">
             <Grip className="w-5 h-5 text-gray-600" />
             <span className="text-[10px] font-bold text-gray-500">MODE</span>
          </button>

          {/* Fan */}
          <button onClick={cycleFan} className="aspect-square bg-white rounded-2xl shadow-md flex flex-col items-center justify-center gap-1 active:bg-gray-50">
             <Fan className="w-5 h-5 text-gray-600" />
             <span className="text-[10px] font-bold text-gray-500">FAN</span>
          </button>

          {/* Swing V */}
          <button onClick={() => state.power && onUpdate({ swingVertical: !state.swingVertical })} className={`aspect-square bg-white rounded-2xl shadow-md flex flex-col items-center justify-center gap-1 active:bg-gray-50 ${state.swingVertical ? 'ring-2 ring-blue-400' : ''}`}>
             <MoveVertical className="w-5 h-5 text-gray-600" />
             <span className="text-[10px] font-bold text-gray-500">V-SWING</span>
          </button>

           {/* Swing H */}
           <button onClick={() => state.power && onUpdate({ swingHorizontal: !state.swingHorizontal })} className={`aspect-square bg-white rounded-2xl shadow-md flex flex-col items-center justify-center gap-1 active:bg-gray-50 ${state.swingHorizontal ? 'ring-2 ring-blue-400' : ''}`}>
             <MoveHorizontal className="w-5 h-5 text-gray-600" />
             <span className="text-[10px] font-bold text-gray-500">H-SWING</span>
          </button>

          {/* Eco */}
          <button onClick={() => state.power && onUpdate({ ecoMode: !state.ecoMode })} className={`aspect-square bg-white rounded-2xl shadow-md flex flex-col items-center justify-center gap-1 active:bg-gray-50 ${state.ecoMode ? 'ring-2 ring-green-400' : ''}`}>
             <Leaf className="w-5 h-5 text-green-600" />
             <span className="text-[10px] font-bold text-gray-500">ECO</span>
          </button>

          {/* Sleep */}
          <button onClick={() => state.power && onUpdate({ sleepMode: !state.sleepMode })} className={`aspect-square bg-white rounded-2xl shadow-md flex flex-col items-center justify-center gap-1 active:bg-gray-50 ${state.sleepMode ? 'ring-2 ring-indigo-400' : ''}`}>
             <Moon className="w-5 h-5 text-indigo-600" />
             <span className="text-[10px] font-bold text-gray-500">SLEEP</span>
          </button>
       </div>

       {/* Smart Voice Input */}
       <div className="mt-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleVoiceSubmit} className="relative flex items-center">
             <input 
               type="text" 
               value={voiceInput}
               onChange={(e) => setVoiceInput(e.target.value)}
               placeholder="AI Command: 'Make it cozy'..."
               className="w-full bg-gray-50 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
               disabled={isProcessingVoice}
             />
             <button 
               type="submit" 
               disabled={isProcessingVoice}
               className="absolute right-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
             >
               {isProcessingVoice ? (
                 <Activity className="w-4 h-4 animate-spin" />
               ) : (
                 <Mic className="w-4 h-4" />
               )}
             </button>
          </form>
       </div>
    </div>
  );
};
