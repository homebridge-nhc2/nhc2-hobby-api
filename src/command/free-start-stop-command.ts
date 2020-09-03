import { Method } from './method';

export const STATUS_CHANGE_COMMAND_TOPIC = 'hobby/control/devices/cmd';
export const FreeStartStopCommand = (uuid: string) => ({
  topic: STATUS_CHANGE_COMMAND_TOPIC,
  data: {
    Method: Method.DEVICES_CONTROL,
    Params: [
      {
        Devices: [
          {
            Uuid: uuid,
            Properties: [
              {
                BasicState: "Triggered",
              },
            ],
          },
        ],
      },
    ],
  },
});
