import {Device} from './device';

export interface Event {
    Method: string,
    Params: [{ Devices: Device[] }]
}
