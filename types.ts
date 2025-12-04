export enum ACMode {
  COOL = 'COOL',
  HEAT = 'HEAT',
  DRY = 'DRY',
  FAN = 'FAN',
  AUTO = 'AUTO',
}

export enum FanSpeed {
  AUTO = 'AUTO',
  LOW = 'LOW',
  MID = 'MID',
  HIGH = 'HIGH',
  TURBO = 'TURBO',
}

export interface ACState {
  power: boolean;
  mode: ACMode;
  targetTemp: number;
  roomTemp: number;
  outdoorTemp: number;
  fanSpeed: FanSpeed;
  swingVertical: boolean;
  swingHorizontal: boolean;
  ecoMode: boolean;
  sleepMode: boolean;
  turboMode: boolean;
  timer: number | null; // Minutes remaining
  airQuality: number; // 0-500 PM2.5
  isCleaning: boolean;
}

export interface EnergyData {
  time: string;
  usage: number; // kWh
}

export interface SmartCommandResponse {
  action?: 'update_settings' | 'query';
  settings?: Partial<ACState>;
  reply: string;
}
