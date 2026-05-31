// Shared project types

export interface HealthResponse {
  name: string;
  version: string;
  uptimeSec: number;
  env: string;
}
