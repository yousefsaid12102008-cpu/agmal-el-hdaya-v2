import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {profileRequest} from '../src/utils/auth-request.js';

test('profile request preserves customer and employee selection', () => {
  assert.deepEqual(profileRequest('customer'), {requestedRole:'customer'});
  assert.deepEqual(profileRequest('employee'), {requestedRole:'employee'});
  assert.deepEqual(profileRequest(), {requestedRole:'customer'});
});

test('profile request rejects self-selected privileged and unknown roles', () => {
  for (const role of ['owner','admin','cashier','',null,{}]) {
    assert.throws(() => profileRequest(role), /invalid-requested-role/);
  }
});

test('auth callable wrapper sends requestedRole rather than an empty payload', async () => {
  let source = await readFile(new URL('../src/services/auth.service.js', import.meta.url), 'utf8');
  source = source.replace(/^import .*;\n/gm, '');
  const calls = [];
  const mocks = {
    configured:true, functions:{}, auth:{}, profileRequest,
    httpsCallable:(_functions,name) => async payload => {calls.push({name,payload}); return {ok:true};}
  };
  const names = Object.keys(mocks);
  const body = source.replace(/export /g,'') + '\nreturn {ensureProfile};';
  const api = new Function(...names, body)(...names.map(name=>mocks[name]));
  await api.ensureProfile('employee');
  await api.ensureProfile('customer');
  assert.deepEqual(calls, [
    {name:'registerProfile',payload:{requestedRole:'employee'}},
    {name:'registerProfile',payload:{requestedRole:'customer'}}
  ]);
});
