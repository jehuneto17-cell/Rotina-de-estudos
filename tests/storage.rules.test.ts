// Caso 8 da matriz do DATABASE.md §6: anexo do diário é privado, vínculo não lê.
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { getBytes, ref, uploadBytes } from 'firebase/storage';

const A = 'uid_a_dono';
const B = 'uid_b_visualizador';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'rotina-estudos-testes',
    storage: { rules: readFileSync('storage.rules', 'utf8') },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearStorage();
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const path = `usuarios/${A}/anexos/reg1/foto.jpg`;
    await uploadBytes(ref(ctx.storage(), path), new Uint8Array([1, 2, 3]), {
      contentType: 'image/jpeg',
    });
  });
});

describe('storage.rules — anexo do diário', () => {
  it('8. B tenta ler o anexo de A — NEGA', async () => {
    const path = `usuarios/${A}/anexos/reg1/foto.jpg`;
    const storageB = testEnv.authenticatedContext(B).storage();
    await assertFails(getBytes(ref(storageB, path)));
  });

  it('dono lê o próprio anexo — PERMITE', async () => {
    const path = `usuarios/${A}/anexos/reg1/foto.jpg`;
    const storageA = testEnv.authenticatedContext(A).storage();
    await assertSucceeds(getBytes(ref(storageA, path)));
  });
});
