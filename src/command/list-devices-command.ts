import { Event } from '../event/event';
import { Method } from './method';

export const LIST_DEVICES_COMMAND_TOPIC = 'hobby/control/devices/cmd';
export const ListDevicesCommand = () => ({
  topic: LIST_DEVICES_COMMAND_TOPIC,
  data: {
    Method: Method.DEVICES_LIST,
  },
});

export function isListDevicesEvent(event: Event): event is Event {
  return event.Method === Method.DEVICES_LIST && !!event.Params;
}
