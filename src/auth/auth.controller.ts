import { Controller, Post, Body, Get, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { Request, raw } from 'express';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles.interface';
import { Auth } from './decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDro: LoginUserDto) {
    return this.authService.login(loginUserDro);
  }

  @Get('check-token')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User,
    // @Headers() headers: IncomingHttpHeaders
  ){
    // return this.authService.checkAuthStatus(user, headers);
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    // @Req() request: Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders
  ) {
    return {
      ok: true,
      msg: 'Hola Mundo private',
      user,
      userEmail,
      rawHeaders,
      headers
    };
  }

  // @SetMetadata('roles', ['admin', 'super-user'])

  @Get('private1')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute(
    @GetUser() user: User
  ) {
    return {
      ok: true,
      msg: 'Hola Mundo private 2',
      user
    };
  }

  @Get('private2')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  privateRoute2(
    @GetUser() user: User
  ) {
    return {
      ok: true,
      msg: 'Hola Mundo private 3',
      user
    };
  }

}
