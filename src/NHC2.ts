import * as mqtt from 'mqtt';
import { IClientOptions } from 'mqtt';
import { Observable, Subject } from 'rxjs';
import { filter, flatMap, map } from 'rxjs/operators';
import { BrightnessChangeCommand } from './command/brightness-change-command';
import { Command } from './command/command';
import { FreeStartStopCommand } from './command/free-start-stop-command';
import { isListDevicesEvent, ListDevicesCommand } from './command/list-devices-command';
import { StatusChangeCommand } from './command/status-change-command';
import { Device } from './event/device';
import { Event } from './event/event';

export class NHC2 {
  public readonly client: mqtt.MqttClient;

  private events = new Subject<Event>();

  constructor(brokerUrl: string, options: IClientOptions) {
    this.client = mqtt.connect(brokerUrl, options);
  }

  public getEvents(): Observable<Event> {
    return this.events.asObservable();
  }

  public async getAccessories(): Promise<Device[]> {
    this.sendListDevicesCommand();

    return new Promise<any>(resolve => {
      return this.events
        .asObservable()
        .pipe(
          filter(event => isListDevicesEvent(event)),
          flatMap(event => event.Params),
          map(params => params.Devices),
        )
        .subscribe(devices => resolve(devices.filter(device =>  device.Type !== 'gatewayfw')));
    });
  }

  public sendListDevicesCommand() {
    this.sendCommand(ListDevicesCommand());
  }

  public sendStatusChangeCommand(deviceUuid: string, state: boolean) {
    this.sendCommand(StatusChangeCommand(deviceUuid, state ? 'On' : 'Off'));
  }

  public sendBrightnessChangeCommand(deviceUuid: string, brightness: number) {
    this.sendCommand(BrightnessChangeCommand(deviceUuid, String(brightness)));
  }

  public sendFreeStartStopCommand(deviceUuid: string) {
    this.sendCommand(FreeStartStopCommand(deviceUuid));
  }

  public async subscribe() {
    return new Promise(resolve => {
      this.client
        .on('connect', () => {
          this.client.subscribe('hobby/control/devices/+', () => resolve()); // Wildcard subscription
        })
        .on('message', (topic: string, message: string) => {
          this.events.next(JSON.parse(message.toString()));
        });
    });
  }

  private sendCommand(command: Command) {
    this.client.publish(command.topic, JSON.stringify(command.data));
  }
}
