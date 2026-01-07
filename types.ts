
export type ShadowDirection = 'bottom' | 'bottom-right' | 'bottom-left' | 'custom';
export type ImageQuality = 'standard' | 'high' | 'ultra';

export interface ShadowConfig {
  intensity: number; // 0 to 100
  softness: number;  // 0 to 100
  direction: ShadowDirection;
  lightAngle: number; // 0 to 360 degrees
  elevation: number; // 0 to 90 degrees (90 is directly overhead)
  shadowDistance: number; // 0 to 100
  spread: number; // 0 to 100
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  prompt: string;
  tooltipText?: string;
  defaultShadow: ShadowConfig;
  isCustom?: boolean;
}

export interface GeneratedVariation {
  id: string;
  url: string;
  styleName: string;
  status: 'loading' | 'completed' | 'error';
  errorMessage?: string;
}

export enum AppState {
  UPLOADING = 'UPLOADING',
  CONFIGURING = 'CONFIGURING',
  GENERATING = 'GENERATING',
  RESULTS = 'RESULTS'
}
