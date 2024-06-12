import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { IncomingHttpHeaders } from 'http';

@Injectable()
export class AuthService {

  private logger = new Logger();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService
  ){}
  
  async register(createUserDto: CreateUserDto) {

    try {
      const { password, ...userData} = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(createUserDto.password, 10)
      });
      await this.userRepository.save(user);
      delete user.password;
      return {
        ...user,
        token: this.getJwt({ id: user.id })
      };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true }
    });
    if(!user) throw new UnauthorizedException(`Credentials are not valid`);
  
    if (!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException(`Credentials are not valid`)
    
    return {
      ...user,
      token: this.getJwt({ id: user.id })
    };
  }

  // async checkAuthStatus(user: User, headers: IncomingHttpHeaders) {
  async checkAuthStatus(user: User) {
    // const headerToken = headers.authorization;
    // if (!headerToken || (headerToken && headerToken.split(" ")[0] !== "Bearer") ) throw new BadRequestException(`Invalid token`)
    // const valid = this.jwtService.verifyAsync(headerToken.split(" ")[1]);
    // if (!valid) throw new ForbiddenException(`Expired session. Please login again`);
    return {
        ...user,
        token: this.getJwt({ id: user.id })
      };
  }

  private getJwt(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleExceptions(error: any): never{
    if(error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(`Unexpected error, check server logs`);
  }

}
