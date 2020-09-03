import { Property } from './property';

export interface Device {
  Uuid: string;
  Properties?: Property[];
  Name?: string;
  Model?: string; // TODO:: mag weg?
  Type?: string;
  Online?: string;
}
