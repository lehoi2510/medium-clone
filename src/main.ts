import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, 
      whitelist: true, 
      forbidNonWhitelisted: false, 
      transformOptions: {
        enableImplicitConversion: true, 
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Medium Clone API')
    .setDescription('API document for Medium Clone backend')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Nhập token vào đây (không cần từ khóa Bearer)',
        in: 'header',
      },
      'jwt',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();