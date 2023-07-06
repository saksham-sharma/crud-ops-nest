import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';

@ApiTags('auth')
@Controller('auth')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post('/signup')
  @ApiOkResponse({
    description: 'User Added Successfully!.',
  })
  @ApiBody({
    description: 'Username and Password',
    type: UserDto,
  })
  async createUser(
    @Body('password') password: string,
    @Body('username') username: string,
  ): Promise<User> {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    const result = await this.usersService.createUser(username, hashedPassword);
    return result;
  }
}
