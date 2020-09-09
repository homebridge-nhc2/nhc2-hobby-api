import { Property } from './property';

export interface Device {
  Uuid: string;
  Properties?: Property[];
  Name?: string;
  Model?: string;
  Type?: string;
  Online?: string;
}
