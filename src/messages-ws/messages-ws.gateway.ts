import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService
  ) {}
  
  handleConnection(client: Socket, ...args: any[]) {
    // console.log('Cliente conectado: ', client.id);
    const token = client.handshake.headers.authorization as string;
    console.log(token);
    
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

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    
    //! Message from server - Emite únicamente al cliente que envió el mensaje.
    // client.emit('message-from-server', {
    //   fullName: payload.id, 
    //   message: payload.message
    // });
    
    //! Message from server - Emitir a todos menos al cliente que envio el mensaje.
    // client.broadcast.emit('message-from-server', {
    //   fullName: payload.id, 
    //   message: payload.message
    // });

    //! Message from server - Emitir a todos inclusive el cliente que envió el mensaje.
    this.wss.emit('message-from-server', {
      fullName: payload.id, 
      message: payload.message
    });
  }

}
