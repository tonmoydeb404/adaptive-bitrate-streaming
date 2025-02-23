import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('HLS-VIDEO')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT, () => {
    console.log('// --------------------------------------------------');
    logger.log(`Server URL        : http://localhost:${process.env.PORT}`);
    logger.log(`API Documentation : http://localhost:${process.env.PORT}/api`);
    console.log('// --------------------------------------------------');
  });
}
bootstrap();
