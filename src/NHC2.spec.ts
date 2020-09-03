import { NHC2 } from './NHC2';
import { noop } from 'rxjs';
import {
  BRIGHTNESS_CHANGED_EVENT,
  buildEvent,
  FREE_START_STOP_EVENT,
  STATUS_CHANGED_EVENT,
} from './test/event-builder';
import { LIST_DEVICES_COMMAND_TOPIC } from './command/list-devices-command';
import { Method } from './command/method';
import { STATUS_CHANGE_COMMAND_TOPIC } from './command/status-change-command';
import { BRIGHTNESS_CHANGE_COMMAND_TOPIC } from './command/brightness-change-command';
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
      fakeMqttServer.server.on('published', function(packet, client) {
        if (packet.topic === LIST_DEVICES_COMMAND_TOPIC) {
          expect(packet.payload.toString()).toBe('{"Method":"devices.list"}');
          done();
        }
      });

      await nhc2.getAccessories();
    });

    it('should list all devices of type `action`', async () => {
      const accesories = await nhc2.getAccessories();
      expect(accesories).toStrictEqual([
        {
          Properties: [{ Status: 'Off' }],
          Name: 'Light 1',
          Uuid: '488d61fa-de6c-4b1c-a832-f1971dc12110',
          Model: 'light',
          Type: 'action',
        },
        {
          Properties: [{ Brightness: '100' }, { Status: 'Off' }],
          Name: 'Dimmer 1',
          Uuid: 'abd4b98b-f197-42ed-a51a-1681b9176228',
          Model: 'dimmer',
          Type: 'action',
        },
      ]);
    });
  });

  describe('sendStatusChangeCommand', () => {
    it('should send the status change command for device with value true', async done => {
      fakeMqttServer.server.on('published', function(packet, client) {
        if (packet.topic === STATUS_CHANGE_COMMAND_TOPIC) {
          expect(packet.payload.toString()).toBe(
            '{"Method":"devices.control","Params":[{"Devices":[{"Uuid":"488d61fa-de6c-4b1c-a832-f1971dc12110","Properties":[{"Status":"On"}]}]}]}',
          );
          done();
        }
      });

      nhc2.sendStatusChangeCommand('488d61fa-de6c-4b1c-a832-f1971dc12110', true);
    });

    it('should send the status change command for device with value true', async done => {
      fakeMqttServer.server.on('published', function(packet, client) {
        if (packet.topic === STATUS_CHANGE_COMMAND_TOPIC) {
          expect(packet.payload.toString()).toBe(
            '{"Method":"devices.control","Params":[{"Devices":[{"Uuid":"488d61fa-de6c-4b1c-a832-f1971dc12110","Properties":[{"Status":"Off"}]}]}]}',
          );
          done();
        }
      });

      nhc2.sendStatusChangeCommand('488d61fa-de6c-4b1c-a832-f1971dc12110', false);
    });
  });

  describe('sendBrightnessChangeCommand', () => {
    it('should send the brightness change command for device with value 50', async done => {
      fakeMqttServer.server.on('published', function(packet, client) {
        if (packet.topic === BRIGHTNESS_CHANGE_COMMAND_TOPIC) {
          expect(packet.payload.toString()).toBe(
            '{"Method":"devices.control","Params":[{"Devices":[{"Uuid":"abd4b98b-f197-42ed-a51a-1681b9176228","Properties":[{"Brightness":"50"}]}]}]}',
          );
          done();
        }
      });

      nhc2.sendBrightnessChangeCommand('abd4b98b-f197-42ed-a51a-1681b9176228', 50);
    });
  });

  describe('onMessage', () => {
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

        fakeMqttServer.server.publish(buildEvent(BRIGHTNESS_CHANGED_EVENT), noop);
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

        fakeMqttServer.server.publish(buildEvent(STATUS_CHANGED_EVENT), noop);
      });
    });

    describe('free start stop command ', () => {
      it('should emit the free start stop event', done => {
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

        fakeMqttServer.server.publish(buildEvent(FREE_START_STOP_EVENT), noop);
      });
    });
  });
});
