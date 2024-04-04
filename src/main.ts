import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import fastifyHelmet from '@fastify/helmet';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import compression from '@fastify/compress';

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

  // await app.register(fastifyHelmet, {
  //   hidePoweredBy: true,
  //   frameguard: { action: 'deny' },
  //   hsts: { maxAge: 5184000 }, // 60 days
  //   ieNoOpen: true,
  //   noSniff: true,
  //   xssFilter: true,
  //   contentSecurityPolicy: {
  //     directives: {
  //       defaultSrc: ['self'],
  //     },
  //   },
  // });

  setupSwagger(app);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.enableShutdownHooks();
  await app.listen(3000, '0.0.0.0');
  logger.log(`Test Server is Running On: ${await app.getUrl()}`);
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
