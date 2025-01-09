import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
    [id:string]: {
        socket: Socket,
        user: User
    };
}

@Injectable()
export class MessagesWsService {

    private connectedClients:ConnectedClients = {};

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){}

    async registerClient(client:Socket, userId:string){
        const user = await this.userRepository.findOneBy({ id: userId });
        if(!user) throw new Error('User not found');
        if(!user.isActive) throw new Error('User is not active');

        this.checkUserConnection(user);

        this.connectedClients[client.id] = { socket: client, user: user };
    }

    removeClient(clientId:string){
        delete this.connectedClients[clientId];
    }

    getConnectedClients():string[]{
        return Object.keys(this.connectedClients);
    }

    getUserFullName(socketId:string):string{
        return this.connectedClients[socketId].user.fullName;
    }
    /**
     * Check if the user is already connected and disconnect the previous connection
     * @param user 
     */
    private checkUserConnection( user: User){
        for(const socketId of Object.keys(this.connectedClients)){
            const connectedClients = this.connectedClients[socketId];
            if(connectedClients.user.id === user.id){
                connectedClients.socket.disconnect();
                break;
            }
        }
    }
}
