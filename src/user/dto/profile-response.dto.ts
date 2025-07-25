import { ApiProperty } from '@nestjs/swagger';
import { Profile } from '../interfaces/profile.interface';

export class ProfileDto {
  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe'
  })
  username: string;

  @ApiProperty({
    description: 'Bio of the user',
    example: 'I work at statefarm',
    nullable: true
  })
  bio: string | null;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://api.realworld.io/images/smiley-cyrus.jpg',
    nullable: true
  })
  image: string | null;

  @ApiProperty({
    description: 'Whether the current user is following this profile',
    example: false
  })
  following: boolean;
}

export class ProfileResponseDto {
  @ApiProperty({
    description: 'User profile information',
    type: ProfileDto
  })
  profile: ProfileDto;
}
