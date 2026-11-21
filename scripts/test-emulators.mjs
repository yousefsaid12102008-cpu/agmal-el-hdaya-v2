import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['node_modules/firebase-tools/lib/bin/firebase.js','emulators:exec','--only','firestore,auth','--project','demo-agaml-phase1','node --test tests/bootstrap.emulator.js && node --test --test-concurrency=1 tests/firestore.emulator.js tests/spark.emulator.js && node tests/approvals.ui.emulator.mjs'],{stdio:'inherit',env:{...process.env,GCE_METADATA_HOST:'127.0.0.1:9'}});
process.exit(result.status??1);
