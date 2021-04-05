import { FanSpeed } from './FanSpeed';

export interface Property {
  Brightness?: string;
  Status?: string;
  Position?: string;
  BasicState?: string;
  FanSpeed?: FanSpeed;
  Moving?: string;
}
