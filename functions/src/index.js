import {initializeApp} from 'firebase-admin/app';
import {getFirestore,FieldValue} from 'firebase-admin/firestore';
import {onCall,HttpsError} from 'firebase-functions/v2/https';
import {defineString} from 'firebase-functions/params';
import {isOwner,validateDecision} from './policy.js';
initializeApp();
const db=getFirestore();
// Explicit deployment region is required. App Check is enforced outside emulators.
const options={region:defineString('ERP_FUNCTION_REGION'),enforceAppCheck:process.env.FUNCTIONS_EMULATOR!=='true',maxInstances:3};
function uidOf(request){if(!request.auth)throw new HttpsError('unauthenticated','Sign in required.');return request.auth.uid;}
export const registerProfile=onCall(options,async request=>{
 const requestedRole=request.data?.requestedRole??'customer';
 if(!['customer','employee'].includes(requestedRole))throw new HttpsError('invalid-argument','Invalid requested account type.');
 const uid=uidOf(request),ref=db.doc(`users/${uid}`),audit=db.collection('audit_logs').doc();
 await db.runTransaction(async tx=>{
  if((await tx.get(ref)).exists)return;
  const now=FieldValue.serverTimestamp();
  tx.create(ref,{uid,displayName:typeof request.auth.token.name==='string'?request.auth.token.name.slice(0,120):'حساب جديد',email:typeof request.auth.token.email==='string'?request.auth.token.email.slice(0,254):null,emailVerified:request.auth.token.email_verified===true,role:'customer',requestedRole,status:'pending',permissions:[],createdAt:now,updatedAt:now});
  tx.create(audit,{actorUid:uid,action:'user.requested',targetUid:uid,before:null,after:{status:'pending',role:'customer',requestedRole,permissions:[]},createdAt:now});
 });
 return {ok:true};
});
export const reviewUser=onCall(options,async request=>{
 const actorUid=uidOf(request);let decision;
 try{decision=validateDecision(request.data,actorUid);}catch{throw new HttpsError('invalid-argument','Invalid account decision.');}
 const actorRef=db.doc(`users/${actorUid}`),targetRef=db.doc(`users/${decision.uid}`),audit=db.collection('audit_logs').doc();
 await db.runTransaction(async tx=>{
  const actor=await tx.get(actorRef),target=await tx.get(targetRef);
  if(!isOwner(actor.data()))throw new HttpsError('permission-denied','Owner required.');
  if(!target.exists)throw new HttpsError('not-found','User not found.');
  if(request.data?.expectedStatus!==undefined && (request.data.expectedStatus!=='pending'||target.data().status!=='pending'))throw new HttpsError('failed-precondition','Request already reviewed.');
  if(target.data().role==='owner')throw new HttpsError('permission-denied','Owner changes require a separate procedure.');
  const {uid,...after}=decision;
  tx.update(targetRef,{...after,updatedAt:FieldValue.serverTimestamp(),reviewedBy:actorUid});
  tx.create(audit,{actorUid,action:'user.reviewed',targetUid:uid,before:{role:target.data().role,status:target.data().status,permissions:target.data().permissions},after,createdAt:FieldValue.serverTimestamp()});
 });return {ok:true};
});
