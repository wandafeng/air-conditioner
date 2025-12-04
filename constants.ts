import { ACMode, ACState, FanSpeed } from './types';

export const INITIAL_AC_STATE: ACState = {
  power: false,
  mode: ACMode.COOL,
  targetTemp: 25,
  roomTemp: 28,
  outdoorTemp: 32,
  fanSpeed: FanSpeed.AUTO,
  swingVertical: false,
  swingHorizontal: false,
  ecoMode: false,
  sleepMode: false,
  turboMode: false,
  timer: null,
  airQuality: 15, // Good
  isCleaning: false,
};

export const MIN_TEMP = 16;
export const MAX_TEMP = 30;

export const MODE_COLORS = {
  [ACMode.COOL]: 'text-blue-500',
  [ACMode.HEAT]: 'text-orange-500',
  [ACMode.DRY]: 'text-purple-500',
  [ACMode.FAN]: 'text-green-500',
  [ACMode.AUTO]: 'text-gray-500',
};

export const MOCK_ENERGY_DATA = [
  { time: '00:00', usage: 0.5 },
  { time: '04:00', usage: 0.4 },
  { time: '08:00', usage: 1.2 },
  { time: '12:00', usage: 2.5 },
  { time: '16:00', usage: 2.1 },
  { time: '20:00', usage: 1.8 },
  { time: '23:59', usage: 0.9 },
];
