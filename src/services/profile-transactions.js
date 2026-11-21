import {collection,doc,getDoc,runTransaction,serverTimestamp} from 'firebase/firestore';
import {validateDecision} from '../../functions/src/policy.js';
// No trusted browser: Firestore rules independently validate every field and audit pair.
export async function registerProfile(db,user,requestedRole='customer'){
 if(!user)throw Object.assign(new Error('Sign in required'),{code:'auth/unauthenticated'});
 if(!['customer','employee'].includes(requestedRole))throw new Error('invalid-requested-role');
 const token=await user.getIdTokenResult();
 const ref=doc(db,'users',user.uid),audit=doc(collection(db,'audit_logs'));
 return runTransaction(db,async tx=>{
  const existing=await tx.get(ref);
  if(existing.exists()){if(token.claims.email_verified===true && existing.data().emailVerified===false)tx.update(ref,{emailVerified:true,updatedAt:serverTimestamp()});return {ok:true};}
  const now=serverTimestamp();
  const p={uid:user.uid,displayName:(user.displayName||'حساب جديد').slice(0,120),email:token.claims.email,emailVerified:token.claims.email_verified===true,role:'customer',requestedRole,status:'pending',permissions:[],createdAt:now,updatedAt:now,lastAuditId:audit.id};
  tx.set(ref,p);tx.set(audit,{actorUid:user.uid,action:'user.requested',targetUid:user.uid,before:null,after:{status:'pending',role:'customer',permissions:[]},createdAt:now});return {ok:true};
 }).catch(async error=>{
  // A simultaneous first login may commit first, turning this create into a denied update.
  // Only accept an existing own profile; never retry an unvalidated write.
  if(error.code==='permission-denied' && (await getDoc(ref)).exists())return {ok:true};
  throw error;
 });
}
export async function reviewProfile(db,actorUid,input,expectedStatus='pending'){
 const decision=validateDecision(input,actorUid),ref=doc(db,'users',decision.uid),audit=doc(collection(db,'audit_logs'));
 return runTransaction(db,async tx=>{
  const target=await tx.get(ref);
  if(!target.exists()||target.data().status!==expectedStatus)throw Object.assign(new Error('Request already reviewed'),{code:'failed-precondition'});
  const old=target.data(),after={status:decision.status,role:decision.role,permissions:decision.permissions},now=serverTimestamp();
  tx.update(ref,{...after,updatedAt:now,reviewedBy:actorUid,lastAuditId:audit.id});
  tx.set(audit,{actorUid,action:'user.reviewed',targetUid:decision.uid,before:{status:old.status,role:old.role,permissions:old.permissions},after,createdAt:now});return {ok:true};
 });
}
