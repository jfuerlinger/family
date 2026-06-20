// Aspire TypeScript AppHost
// For more information, see: https://aspire.dev

import { createBuilder } from './.aspire/modules/aspire.mjs';

const builder = await createBuilder();

const compose = await builder.addDockerComposeEnvironment('compose');

const postgres = await builder.addPostgres('db', {
  port: 5432,
});

await postgres.withImageTag('17-alpine');
await postgres.withDataVolume();

const database = postgres.addDatabase('family');

const app = await builder.addDockerfile('app', '..');
await app.withHttpEndpoint({ name: 'http', port: 3000, targetPort: 3000 });
await app.withExternalHttpEndpoints();
await app.withReference(database);
await app.withEnvironment('DATABASE_URL', database);
await app.withEnvironment('AUTH_SECRET', 'insecure-dev-secret-change-me');
await app.withEnvironment('AUTH_TRUST_HOST', 'true');
await app.waitFor(postgres);
await app.withComputeEnvironment(compose);

await postgres.withComputeEnvironment(compose);

await builder.build().run();