import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import * as request from 'supertest';
import { ValidationPipe } from '@nestjs/common';

// Setting up test server and utilities

export class TestServer {
  constructor(
    public readonly serverApplication: NestFastifyApplication,
    public readonly testingModule: TestingModule,
  ) {
  }

  public static async new(
    testingModuleBuilder: TestingModuleBuilder,
  ): Promise<TestServer> {
    const testingModule: TestingModule = await testingModuleBuilder.compile();

    const app: NestFastifyApplication = testingModule.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );

    app.enableShutdownHooks();

    await app.init();

    return new TestServer(app, testingModule);
  }
}

let testServer: TestServer;

export async function generateTestingApplication(): Promise<{
  testServer: TestServer;
}> {
  const testServer = await TestServer.new(
    Test.createTestingModule({
      imports: [AppModule],
    }),
  );

  return {
    testServer,
  };
}

export function getTestServer(): TestServer {
  return testServer;
}

export function getHttpServer(): request.SuperTest<request.Test> {
  const testServer = getTestServer();
  return request(testServer.serverApplication.getHttpServer());
}

// setup
beforeAll(async (): Promise<void> => {
  ({ testServer } = await generateTestingApplication());
});

// cleanup
afterAll(async (): Promise<void> => {
  await testServer.serverApplication.close();
});
