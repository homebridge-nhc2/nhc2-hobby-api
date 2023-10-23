import { FanSpeed } from './FanSpeed';
import { LastDirection } from './LastDirection';

export interface Property {
  Brightness?: string;
  Status?: string;
  Position?: string;
  BasicState?: string;
  FanSpeed?: FanSpeed;
  Moving?: string;
  LastDirection?: LastDirection;
}
