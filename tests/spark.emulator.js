import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,createUserWithEmailAndPassword,signInWithEmailAndPassword,signInWithCredential,GoogleAuthProvider} from 'firebase/auth';
import {getFirestore as clientDB,connectFirestoreEmulator,doc,onSnapshot,setDoc,updateDoc,writeBatch,serverTimestamp,collection} from 'firebase/firestore';
import {createRequire} from 'node:module';
import {registerProfile,reviewProfile} from '../src/services/profile-transactions.js';
const require=createRequire(new URL('../functions/package.json',import.meta.url));
const {initializeApp:adminApp,deleteApp:deleteAdmin}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
const {getAuth:adminAuth}=require('firebase-admin/auth');
if(process.env.GCLOUD_PROJECT!=='demo-agaml-phase1'||!process.env.FIRESTORE_EMULATOR_HOST||!process.env.FIREBASE_AUTH_EMULATOR_HOST)throw new Error('Demo emulators required');
const projectId='demo-agaml-phase1',admin=adminApp({projectId}),db=getFirestore(admin),apps=[];
function client(name){const app=initializeApp({projectId,apiKey:'demo-key',appId:'demo-app'},name);apps.push(app);const auth=getAuth(app);connectAuthEmulator(auth,'http://'+process.env.FIREBASE_AUTH_EMULATOR_HOST,{disableWarnings:true});const store=clientDB(app);connectFirestoreEmulator(store,'127.0.0.1',8180);return {auth,db:store};}
after(async()=>{await Promise.all(apps.map(deleteApp));await deleteAdmin(admin);});
test('Spark real Auth registration, atomic owner review, audit, races and suspension',async()=>{
 const stamp=Date.now(),password='Local-emulator-test-only-9876!';
 const person=client('spark-person-'+stamp),owner=client('spark-owner-'+stamp),other=client('spark-other-'+stamp);
 const p=(await createUserWithEmailAndPassword(person.auth,`person-${stamp}@example.test`,password)).user;
 await assert.rejects(registerProfile(person.db,p,'owner'));
 // Forge full registration payloads, bypassing every local validator.
 async function forgedRegistration(changes,auditChanges={}){
  const audit=doc(collection(person.db,'audit_logs')),batch=writeBatch(person.db),now=serverTimestamp();
  const value={uid:p.uid,displayName:'Test',email:p.email,emailVerified:false,role:'customer',requestedRole:'customer',status:'pending',permissions:[],createdAt:now,updatedAt:now,lastAuditId:audit.id,...changes};
  batch.set(doc(person.db,'users',p.uid),value);batch.set(audit,{actorUid:p.uid,targetUid:p.uid,action:'user.requested',before:null,after:{status:value.status,role:value.role,permissions:value.permissions},createdAt:now,...auditChanges});return batch.commit();
 }
 for(const changes of [{role:'owner',status:'active'},{permissions:['view_inventory']},{email:'forged@example.test'},{emailVerified:true},{requestedRole:'owner'},{extra:'untrusted'}])await assert.rejects(forgedRegistration(changes));
 await assert.rejects(forgedRegistration({},{actorUid:'forged-owner'}));
 await assert.rejects(forgedRegistration({},{before:{status:'active'}}));
 await Promise.all([registerProfile(person.db,p,'employee'),registerProfile(person.db,p,'employee')]);
 let profile=(await db.doc('users/'+p.uid).get()).data();assert.equal(profile.requestedRole,'employee');assert.equal(profile.status,'pending');assert.equal(profile.email,p.email);assert.equal(profile.emailVerified,false);assert.deepEqual(profile.permissions,[]);
 assert.equal((await db.collection('audit_logs').where('targetUid','==',p.uid).get()).size,1);
 const o=(await createUserWithEmailAndPassword(owner.auth,`owner-${stamp}@example.test`,password)).user;
 await adminAuth(admin).updateUser(o.uid,{emailVerified:true});await o.getIdToken(true);await registerProfile(owner.db,o);await db.doc('users/'+o.uid).update({role:'owner',status:'active'}); // isolated privileged fixture only
 await assert.rejects(reviewProfile(owner.db,o.uid,{uid:p.uid,status:'active',role:'employee',permissions:[]}));
 await adminAuth(admin).updateUser(p.uid,{emailVerified:true});await p.getIdToken(true);await registerProfile(person.db,p,'employee');assert.equal((await db.doc('users/'+p.uid).get()).data().emailVerified,true);
 const input={uid:p.uid,status:'active',role:'employee',permissions:['view_inventory']};
 await assert.rejects(reviewProfile(person.db,p.uid,input));
 await assert.rejects(updateDoc(doc(person.db,'users',p.uid),{role:'owner',status:'active'}));
 await assert.rejects(updateDoc(doc(owner.db,'users',p.uid),{status:'active',role:'employee',permissions:[]})); // no audit
 await assert.rejects(reviewProfile(owner.db,o.uid,{...input,permissions:['manage_treasury']}));
 // Bypass all client validation to test actual rules with a forged financial grant.
 const audit=doc(collection(owner.db,'audit_logs')),batch=writeBatch(owner.db),now=serverTimestamp();
 batch.update(doc(owner.db,'users',p.uid),{status:'active',role:'employee',permissions:['manage_treasury'],updatedAt:now,reviewedBy:o.uid,lastAuditId:audit.id});
 batch.set(audit,{actorUid:o.uid,targetUid:p.uid,action:'user.reviewed',before:{status:'pending',role:'customer',permissions:[]},after:{status:'active',role:'employee',permissions:['manage_treasury']},createdAt:now});await assert.rejects(batch.commit());
 const race=await Promise.allSettled([reviewProfile(owner.db,o.uid,input),reviewProfile(owner.db,o.uid,{...input,status:'rejected'})]);assert.equal(race.filter(r=>r.status==='fulfilled').length,1);
 profile=(await db.doc('users/'+p.uid).get()).data();assert.ok(['active','rejected'].includes(profile.status));
 const logs=await db.collection('audit_logs').where('targetUid','==',p.uid).get();assert.equal(logs.size,2);
 await assert.rejects(setDoc(doc(owner.db,'audit_logs','forged-'+stamp),{actorUid:o.uid}));
 await assert.rejects(updateDoc(doc(owner.db,'audit_logs',profile.lastAuditId),{actorUid:'forged'}));
 await assert.rejects(updateDoc(doc(owner.db,'users',o.uid),{role:'customer'}));
 // A separate real account tests suspension propagation and removal of owner authority.
 const c=(await createUserWithEmailAndPassword(other.auth,`other-${stamp}@example.test`,password)).user;await registerProfile(other.db,c,'customer');await adminAuth(admin).updateUser(c.uid,{emailVerified:true});await c.getIdToken(true);await registerProfile(other.db,c);
 await reviewProfile(owner.db,o.uid,{uid:c.uid,status:'active',role:'customer',permissions:['view_own_orders']});
 const second=client('spark-second-'+stamp);await signInWithEmailAndPassword(second.auth,c.email,password);
 const suspended=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Suspension timeout')),10000);const stop=onSnapshot(doc(second.db,'users',c.uid),snap=>{if(snap.data()?.status==='suspended'){clearTimeout(timer);stop();resolve();}},reject);});
 await reviewProfile(owner.db,o.uid,{uid:c.uid,status:'suspended',role:'customer',permissions:[]},'active');await suspended;
 // Provider-token fixture, not a production Google OAuth acceptance test.
 const google=client('spark-google-'+stamp);
 const payload={sub:'google-'+stamp,email:`google-${stamp}@example.test`,email_verified:true,name:'Google Test',iss:'https://accounts.google.com',aud:'demo-client',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600};
 const fakeToken=Buffer.from(JSON.stringify({alg:'none',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify(payload)).toString('base64url')+'.';
 const g=(await signInWithCredential(google.auth,GoogleAuthProvider.credential(fakeToken))).user;await registerProfile(google.db,g,'employee');const gp=(await db.doc('users/'+g.uid).get()).data();assert.equal(gp.emailVerified,true);assert.equal(gp.status,'pending');assert.equal(gp.requestedRole,'employee');assert.deepEqual(gp.permissions,[]);
 await db.doc('users/'+o.uid).update({status:'suspended'});
 await assert.rejects(reviewProfile(owner.db,o.uid,{uid:c.uid,status:'active',role:'customer',permissions:[]},'suspended'));
});
