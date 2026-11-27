import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
const env = await initializeTestEnvironment({ projectId: 'agmal-el-hdaya-erp', firestore: { host: 'localhost', port: 8181, rules: readFileSync('/tmp/p4s/finance-dossier/candidate/candidate-strict-v7-rem.rules','utf8') }, auth: { host: 'localhost', port: 9099 } });
await env.clearFirestore();
const d=n=>Timestamp.fromMillis(Date.now()-n*864e5);
await env.withSecurityRulesDisabled(async (ctx) => {
  const f = ctx.firestore();
  await setDoc(doc(f,'users/52c1C32LpzkTyrb1syFc6bh26ZcH'),{role:'owner',status:'active',displayName:'يوسف',permissions:['create_sales','cancel_sales'],warehouses:[],requestedRole:'owner'});
  await setDoc(doc(f,'phase3_accounts/bank'),{name:'بنك',active:true,method:'bank',balance:20000,users:[]});
  const C=[['C1','عميل اختبار 1','01000000001',215000,22],['C2','عميل اختبار 2','01000000002',340000,19],['C3','عميل اختبار 3','01000000003',107000,12],['C4','عميل اختبار 4','01000000004',120000,5],['C5','عميل بلا هاتف','',50000,40]];
  for(const [id,name,phone,due,ago] of C){ await setDoc(doc(f,'phase3_customers/'+id),{name,phone,active:true,due}); await setDoc(doc(f,'phase4_collections/col-'+id),{customer:id,amount:100,at:d(ago)}); }
  await setDoc(doc(f,'phase3_customers/C6'),{name:'عميل بلا دين',phone:'01000000006',active:true,due:0});
  await setDoc(doc(f,'phase4_reminders/rem-old-C2'),{customer:'C2',at:d(16),actor:'x',channel:'manual'});
});
console.log('rem seeded'); process.exit(0);
