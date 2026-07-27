import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';

@ApiTags('Master Administration - Auth')
@Controller('api/master/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Super Admin Login' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
