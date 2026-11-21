import {readFile} from 'node:fs/promises';
import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {doc,getDoc,getDocs,collection,setDoc,updateDoc,deleteDoc} from 'firebase/firestore';
let env;
before(async()=>{
 env=await initializeTestEnvironment({projectId:'demo-agaml-phase1',firestore:{rules:await readFile(new URL('../firestore.rules',import.meta.url),'utf8')}});
 await env.clearFirestore();
 await env.withSecurityRulesDisabled(async context=>{
  const db=context.firestore();
  for(const [uid,role,status] of [['owner','owner','active'],['employee','employee','active'],['customer','customer','active'],['pending','customer','pending'],['suspended','owner','suspended']]){
   await setDoc(doc(db,'users',uid),{uid,role,status,permissions:[]});
  }
  await setDoc(doc(db,'audit_logs','entry'),{action:'user.requested'});
  await setDoc(doc(db,'accounts','cash'),{balance:100});
  await setDoc(doc(db,'sales','sale'),{customerUid:'customer'});
 });
});
after(async()=>env?.cleanup());
const dbFor=uid=>uid?env.authenticatedContext(uid,{email_verified:true,email:uid+'@example.test',auth_time:1000}).firestore():env.unauthenticatedContext().firestore();
test('unauthenticated reads and writes are denied',async()=>{
 const db=dbFor();
 await assertFails(getDoc(doc(db,'users','customer')));
 await assertFails(setDoc(doc(db,'users','intruder'),{role:'owner',status:'active'}));
});
test('each signed-in user can get own status but not another profile',async()=>{
 for(const uid of ['employee','customer','pending','suspended']){
  const db=dbFor(uid);await assertSucceeds(getDoc(doc(db,'users',uid)));
  await assertFails(getDoc(doc(db,'users','owner')));
  await assertFails(getDocs(collection(db,'users')));
 }
});
test('active owner can inspect users and audit; suspended owner cannot',async()=>{
 const owner=dbFor('owner');await assertSucceeds(getDocs(collection(owner,'users')));await assertSucceeds(getDocs(collection(owner,'audit_logs')));
 await assertFails(getDoc(doc(dbFor('suspended'),'audit_logs','entry')));
});
test('no client can create privileged profiles, self-promote or delete profiles',async()=>{
 for(const uid of ['owner','employee','customer','pending']){
  const db=dbFor(uid);
  await assertFails(setDoc(doc(db,'users','new-user'),{role:'owner',status:'active'}));
  await assertFails(updateDoc(doc(db,'users',uid),{role:'owner',status:'active'}));
  await assertFails(deleteDoc(doc(db,'users','customer')));
 }
});
test('operational collections and unpaired client audit writes remain closed',async()=>{
 for(const uid of ['owner','employee','customer','pending','suspended']){
  const db=dbFor(uid);
  await assertFails(getDoc(doc(db,'accounts','cash')));await assertFails(getDoc(doc(db,'sales','sale')));
  await assertFails(setDoc(doc(db,'accounts','cash'),{balance:99999}));
  await assertFails(setDoc(doc(db,'audit_logs','forged'),{actorUid:'owner'}));
 }
});

test('login history is append-only, token-time-bound and owner-readable only',async()=>{
 const {serverTimestamp,Timestamp}=await import('firebase/firestore');const own=dbFor('employee'),ref=doc(own,'login_events','employee','events','1000');
 const data={authTime:1000,recordedAt:serverTimestamp(),deviceLabel:'iPhone · iOS',source:'client-reported'};
 await assertSucceeds(setDoc(ref,data));await assertFails(setDoc(ref,data));await assertFails(deleteDoc(ref));
 await assertFails(getDoc(ref));await assertSucceeds(getDoc(doc(dbFor('owner'),'login_events','employee','events','1000')));
 await assertSucceeds(getDocs(collection(dbFor('owner'),'login_events','employee','events')));await assertFails(getDocs(collection(own,'login_events','employee','events')));
 await assertFails(setDoc(doc(own,'login_events','customer','events','1000'),data));
 await assertFails(setDoc(doc(own,'login_events','employee','events','1001'),{...data,authTime:1001}));
 await assertFails(setDoc(doc(dbFor('pending'),'login_events','pending','events','1000'),{...data,recordedAt:Timestamp.fromMillis(1)}));
 await assertFails(setDoc(doc(dbFor('pending'),'login_events','pending','events','1000'),{...data,role:'owner'}));
 await assertFails(setDoc(doc(own,'login_activity','employee'),{lastSignInAt:serverTimestamp(),deviceLabel:'Fake',source:'client-reported'}));
});
