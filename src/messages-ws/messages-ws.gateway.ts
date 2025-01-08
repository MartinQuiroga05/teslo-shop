import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private logger = new Logger('MessagesWsGateway');
  
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}
  
  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.headers.authorization as string;
    // this.logger.log(`Client id: ${client.id}`);
    let payload:JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      this.logger.error(`WS error: ${error.message}`);
      client.disconnect();
      return;
    }
    // this.logger.log(payload);
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
      fullName: this.messagesWsService.getUserFullName(client.id), 
      message: payload.message
    });
  }

}
