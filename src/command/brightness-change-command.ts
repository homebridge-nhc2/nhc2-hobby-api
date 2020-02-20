import { Method } from './method';

export const BRIGHTNESS_CHANGE_COMMAND_TOPIC = 'hobby/control/devices/cmd';
export const BrightnessChangeCommand = (uuid: string, value: string) => ({
  topic: BRIGHTNESS_CHANGE_COMMAND_TOPIC,
  data: {
    Method: Method.DEVICES_CONTROL,
    Params: [
      {
        Devices: [
          {
            Uuid: uuid,
            Properties: [
              {
                Brightness: value,
              },
            ],
          },
        ],
      },
    ],
  },
});
