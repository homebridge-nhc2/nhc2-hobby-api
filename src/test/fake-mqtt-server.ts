import { Server } from 'mosca';
import { LIST_DEVICES_COMMAND_TOPIC } from '../command/list-devices-command';
import { Command } from '../command/command';
import { Method } from '../command/method';
import { buildEvent, LIST_DEVICS_EVENT } from './event-builder';
import { noop } from 'rxjs';

export default class FakeMqttServer {
  public readonly PORT = 1883;
  public server: Server;

  constructor() {
    this.server = new Server({ port: this.PORT });
    this.server.on('published', (packet, client) => {
      switch (packet.topic) {
        case LIST_DEVICES_COMMAND_TOPIC:
          const message: Command = {
            topic: packet.topic,
            data: JSON.parse(packet.payload),
          };

          switch (message.data.Method) {
            case Method.DEVICES_LIST:
              this.server.publish(buildEvent(LIST_DEVICS_EVENT), noop);
              break;
          }
      }
    });
  }

  close() {
    this.server.close();
  }
}
