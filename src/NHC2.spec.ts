import { noop } from 'rxjs';
import { BRIGHTNESS_CHANGE_COMMAND_TOPIC } from './command/brightness-change-command';
import { LIST_DEVICES_COMMAND_TOPIC } from './command/list-devices-command';
import { Method } from './command/method';
import { POSITION_CHANGE_COMMAND_TOPIC } from './command/position-change-command';
import { STATUS_CHANGE_COMMAND_TOPIC } from './command/status-change-command';
import { FanSpeed } from './event/FanSpeed';
import { NHC2 } from './NHC2';
import {
  BRIGHTNESS_CHANGED_EVENT,
  buildEvent,
  FAN_SPEED_EVENT,
  POSITION_CHANGED_EVENT,
  STATUS_CHANGED_EVENT,
  TRIGGER_BASIC_STATE_EVENT,
} from './test/event-builder';
import FakeMqttServer from './test/fake-mqtt-server';

let fakeMqttServer: FakeMqttServer;
let nhc2: NHC2;

describe('NHC2', () => {
  beforeEach(async () => {
    fakeMqttServer = new FakeMqttServer();

    nhc2 = new NHC2('mqtt://localhost', { port: fakeMqttServer.PORT });
    await nhc2.subscribe();
  });

  afterEach(() => {
    fakeMqttServer.close();
  });

  describe('getAccessories', () => {
    it('should send the list devices command', async done => {
      fakeMqttServer.broker.subscribe(LIST_DEVICES_COMMAND_TOPIC, (packet, _) => {
        if (packet.topic === LIST_DEVICES_COMMAND_TOPIC) {
          expect(packet.payload.toString()).toBe('{"Method":"devices.list"}');
          done();
        }
      }, noop);

      await nhc2.getAccessories();
    });

    it('should list only Online devices', async () => {
      const accesories = await nhc2.getAccessories();
      expect(accesories).toStrictEqual([
        {
          Properties: [{ Status: 'Off' }],
          Name: 'Light 1',
          Uuid: '488d61fa-de6c-4b1c-a832-f1971dc12110',
          Model: 'light',
          Type: 'action',
          Online: 'True',
        },
        {
          Properties: [{ Brightness: '100' }, { Status: 'Off' }],
          Name: 'Dimmer 1',
          Uuid: 'abd4b98b-f197-42ed-a51a-1681b9176228',
          Model: 'dimmer',
          Type: 'action',
          Online: 'True',
        },
      ]);
    });
  });

  describe('sendStatusChangeCommand', () => {
    it('should send the status change command for device with value true', async done => {
      fakeMqttServer.broker.subscribe(STATUS_CHANGE_COMMAND_TOPIC, (packet, _) => {
        if (packet.topic === STATUS_CHANGE_COMMAND_TOPIC) {
          expect(packet.payload.toString()).toBe(
            '{"Method":"devices.control","Params":[{"Devices":[{"Uuid":"488d61fa-de6c-4b1c-a832-f1971dc12110","Properties":[{"Status":"On"}]}]}]}',
          );
          done();
        }
      }, noop);

      nhc2.sendStatusChangeCommand('488d61fa-de6c-4b1c-a832-f1971dc12110', true);
    });

    it('should send the status change command for device with value true', async done => {
      fakeMqttServer.broker.subscribe(STATUS_CHANGE_COMMAND_TOPIC, (packet, _) => {
        if (packet.topic === STATUS_CHANGE_COMMAND_TOPIC) {
          expect(packet.payload.toString()).toBe(
            '{"Method":"devices.control","Params":[{"Devices":[{"Uuid":"488d61fa-de6c-4b1c-a832-f1971dc12110","Properties":[{"Status":"Off"}]}]}]}',
          );
          done();
        }
      }, noop);

      nhc2.sendStatusChangeCommand('488d61fa-de6c-4b1c-a832-f1971dc12110', false);
    });
  });

  describe('sendBrightnessChangeCommand', () => {
    it('should send the brightness change command for device with value 50', async done => {
      fakeMqttServer.broker.subscribe(BRIGHTNESS_CHANGE_COMMAND_TOPIC, (packet, _) => {
        if (packet.topic === BRIGHTNESS_CHANGE_COMMAND_TOPIC) {
          expect(packet.payload.toString()).toBe(
            '{"Method":"devices.control","Params":[{"Devices":[{"Uuid":"abd4b98b-f197-42ed-a51a-1681b9176228","Properties":[{"Brightness":"50"}]}]}]}',
          );
          done();
        }
      }, noop);

      nhc2.sendBrightnessChangeCommand('abd4b98b-f197-42ed-a51a-1681b9176228', 50);
    });
  });

  describe('sendPositionChangeCommand', () => {
    it('should send the position change command for device with value 50', async done => {
      fakeMqttServer.broker.subscribe(POSITION_CHANGE_COMMAND_TOPIC, (packet, _) => {
        if (packet.topic === POSITION_CHANGE_COMMAND_TOPIC) {
          expect(packet.payload.toString()).toBe(
            '{"Method":"devices.control","Params":[{"Devices":[{"Uuid":"abd4b98b-f197-42ed-a51a-1681b9176228","Properties":[{"Position":"50"}]}]}]}',
          );
          done();
        }
      }, noop);

      nhc2.sendPositionChangeCommand('abd4b98b-f197-42ed-a51a-1681b9176228', 50);
    });
  });

  describe('onMessage', () => {
    describe('update fan speed', () => {
      it('should emit thefan speed event', done => {
        nhc2.getEvents().subscribe(event => {
          expect(event).toStrictEqual({
            Method: Method.DEVICES_STATUS,
            Params: [
              {
                Devices: [
                  {
                    Properties: [{ FanSpeed: FanSpeed.High }],
                    Uuid: '25ee33e3-5b9c-4171-8ede-7e94f1cb6b33',
                  },
                ],
              },
            ],
          });
          done();
        });

        fakeMqttServer.broker.publish(buildEvent(FAN_SPEED_EVENT), noop);
      });
    });

    describe('brigthness change event', () => {
      it('should emit the brightness change event', done => {
        nhc2.getEvents().subscribe(event => {
          expect(event).toStrictEqual({
            Method: Method.DEVICES_STATUS,
            Params: [
              {
                Devices: [
                  {
                    Properties: [{ Brightness: '34' }],
                    Uuid: '25ee33e3-5b9c-4171-8ede-7e94f1cb6b33',
                  },
                ],
              },
            ],
          });
          done();
        });

        fakeMqttServer.broker.publish(buildEvent(BRIGHTNESS_CHANGED_EVENT), noop);
      });
    });

    describe('status change event', () => {
      it('should emit the status change event', done => {
        nhc2.getEvents().subscribe(event => {
          expect(event).toStrictEqual({
            Method: Method.DEVICES_STATUS,
            Params: [
              {
                Devices: [
                  {
                    Properties: [{ Status: 'On' }],
                    Uuid: '25ee33e3-5b9c-4171-8ede-7e94f1cb6b33',
                  },
                ],
              },
            ],
          });
          done();
        });

        fakeMqttServer.broker.publish(buildEvent(STATUS_CHANGED_EVENT), noop);
      });
    });

    describe('position change event', () => {
      it('should emit the position change event', done => {
        nhc2.getEvents().subscribe(event => {
          expect(event).toStrictEqual({
            Method: Method.DEVICES_STATUS,
            Params: [
              {
                Devices: [
                  {
                    Properties: [{ Position: '55' }],
                    Uuid: '25ee33e3-5b9c-4171-8ede-7e94f1cb6b33',
                  },
                ],
              },
            ],
          });
          done();
        });

        fakeMqttServer.broker.publish(buildEvent(POSITION_CHANGED_EVENT), noop);
      });
    });

    describe('trigger basic state', () => {
      it('should emit the basic state trigger event', done => {
        nhc2.getEvents().subscribe(event => {
          expect(event).toStrictEqual({
            Method: Method.DEVICES_STATUS,
            Params: [
              {
                Devices: [
                  {
                    Properties: [{ BasicState: 'On' }],
                    Uuid: '25ee33e3-5b9c-4171-8ede-7e94f1cb6b33',
                  },
                ],
              },
            ],
          });
          done();
        });

        fakeMqttServer.broker.publish(buildEvent(TRIGGER_BASIC_STATE_EVENT), noop);
      });

      it('should send the basic state change command for device', async done => {
        fakeMqttServer.broker.subscribe(STATUS_CHANGE_COMMAND_TOPIC, (packet, _) => {
          if (packet.topic === STATUS_CHANGE_COMMAND_TOPIC) {
            expect(packet.payload.toString()).toBe(
              '{"Method":"devices.control","Params":[{"Devices":[{"Uuid":"abd4b98b-f197-42ed-a51a-1681b9176228","Properties":[{"BasicState":"Triggered"}]}]}]}',
            );
            done();
          }
        }, noop);

        nhc2.sendTriggerBasicStateCommand('abd4b98b-f197-42ed-a51a-1681b9176228');
      });

      it('should send the fan speed change command', async done => {
        fakeMqttServer.broker.subscribe(STATUS_CHANGE_COMMAND_TOPIC, (packet, _) => {
          if (packet.topic === STATUS_CHANGE_COMMAND_TOPIC) {
            expect(packet.payload.toString()).toBe(
              '{"Method":"devices.control","Params":[{"Devices":[{"Uuid":"abd4b98b-f197-42ed-a51a-1681b9176228","Properties":[{"FanSpeed":"Medium"}]}]}]}',
            );
            done();
          }
        }, noop);

        nhc2.sendFanSpeedCommand('abd4b98b-f197-42ed-a51a-1681b9176228', FanSpeed.Medium);
      });
    });
  });
});
