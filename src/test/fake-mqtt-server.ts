import * as aedes from 'aedes';
import { createServer, Server } from 'net';
import { LIST_DEVICES_COMMAND_TOPIC } from '../command/list-devices-command';
import { Command } from '../command/command';
import { Method } from '../command/method';
import { buildEvent, LIST_DEVICS_EVENT } from './event-builder';
import { noop } from 'rxjs';

export default class FakeMqttServer {
  public readonly PORT = 1883;
  public broker: aedes.Aedes;
  public server: Server;

  constructor() {
    this.broker = aedes();
    this.server = createServer(this.broker.handle);
    this.server.listen(this.PORT, noop);
    // this.server = new Server({ port: this.PORT });
    this.broker.subscribe(LIST_DEVICES_COMMAND_TOPIC, (packet, _) => {
      switch (packet.topic) {
        case LIST_DEVICES_COMMAND_TOPIC:
          const message: Command = {
            topic: packet.topic,
            data: JSON.parse(packet.payload.toString()),
          };

          switch (message.data.Method) {
            case Method.DEVICES_LIST:
              this.broker.publish(buildEvent(LIST_DEVICS_EVENT), noop);
              break;
          }
      }
    }, noop);
  }

  close() {
    this.broker.close();
    this.server.close();
  }
}
