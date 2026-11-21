import {writeFile,access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
// Demo-only command: never selects or deploys to a real Firebase project.
const local=new URL('../functions/.env.local',import.meta.url);
try { await access(local); } catch { await writeFile(local,'ERP_FUNCTION_REGION=me-central2\n'); }
const result=spawnSync(process.execPath,['node_modules/firebase-tools/lib/bin/firebase.js','emulators:exec','--only','firestore,auth,functions','--project','demo-agaml-phase1','node --test --test-concurrency=1 tests/firestore.emulator.js tests/functions.emulator.js'],{stdio:'inherit',env:{...process.env,GCE_METADATA_HOST:'127.0.0.1:9'}});
process.exit(result.status??1);
