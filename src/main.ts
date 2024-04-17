import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import helmet from '@fastify/helmet';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import compression from '@fastify/compress';
import { AppModule } from '@src/app.module';

declare const module: any;
async function bootstrap() {
  const logger = new Logger(bootstrap.name);
  const fastifyAdapter = new FastifyAdapter({
    bodyLimit: 20 * 1024 * 1024,
  });
  const app: NestFastifyApplication =
    await NestFactory.create<NestFastifyApplication>(
      AppModule,
      fastifyAdapter,
      {
        // logger: new AppLogger(),
        rawBody: true,
      },
    );
  await app.register(multipart);
  await app.register(compression, { encodings: ['gzip', 'deflate'] });
  await app.register(helmet);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableShutdownHooks();

  setupSwagger(app);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(3000, '0.0.0.0');
  logger.log(`Test Server is Running On: ${await app.getUrl()}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

function setupSwagger(app: INestApplication): void {
  const documentBuilder = new DocumentBuilder()
    .setTitle('API 문서')
    .setDescription(
      process.env.MODE === 'dev' || process.env.MODE === 'local'
        ? '개발용 API 문서 입니다'
        : '운영용 API 문서 입니다',
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'authorization',
      description: 'Enter JWT token',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}

bootstrap();
