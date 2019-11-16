import {Method} from './method';

export const STATUS_CHANGE_COMMAND_TOPIC = 'hobby/control/devices/cmd';
export const StatusChangeCommand = (uuid: string, state: string) => ({
    topic: STATUS_CHANGE_COMMAND_TOPIC,
    data: {
        Method: Method.DEVICES_CONTROL,
        Params: [{
            Devices: [{
                Uuid: uuid,
                Properties: [
                    {
                        Status: state
                    }
                ]
            }]
        }]
    }
});
