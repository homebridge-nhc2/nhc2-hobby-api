import { Method } from './method';

export const POSITION_CHANGE_COMMAND_TOPIC = 'hobby/control/devices/cmd';
export const PositionChangeCommand = (uuid: string, position: string) => ({
  topic: POSITION_CHANGE_COMMAND_TOPIC,
  data: {
    Method: Method.DEVICES_CONTROL,
    Params: [
      {
        Devices: [
          {
            Uuid: uuid,
            Properties: [
              {
                Position: position,
              },
            ],
          },
        ],
      },
    ],
  },
});
