import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService
  ) {}
  
  handleConnection(client: Socket, ...args: any[]) {
    // console.log('Cliente conectado: ', client.id);
    this.messagesWsService.registerClient(client);
    // console.log({conectados: this.messagesWsService.getConnectedClients()});
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }
  
  handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado: ', client.id);
    this.messagesWsService.removeClient(client.id);
    // console.log({conectados: this.messagesWsService.getConnectedClients()});
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

}
