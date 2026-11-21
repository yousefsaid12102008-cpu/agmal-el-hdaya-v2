// Preparation only. This procedure deliberately refuses every live project.
// It is never exported as a callable and never imported by browser code.
export async function prepareOwnerInEmulator({db,auth,uid,confirmationUid,projectId,serverTimestamp}){
 if(projectId!=='demo-agaml-phase1'||process.env.GCLOUD_PROJECT!=='demo-agaml-phase1')throw new Error('demo-project-required');
 for(const key of ['FIRESTORE_EMULATOR_HOST','FIREBASE_AUTH_EMULATOR_HOST']){
  if(!/^127\.0\.0\.1:\d+$/.test(process.env[key]||''))throw new Error('loopback-emulators-required');
 }
 if(typeof uid!=='string'||!uid||uid.includes('/')||uid.length>128||uid!==confirmationUid)throw new Error('explicit-uid-confirmation-required');
 const account=await auth.getUser(uid);
 if(account.disabled||!account.email||!account.emailVerified)throw new Error('verified-enabled-auth-account-required');
 const user=db.doc(`users/${uid}`),lock=db.doc('system_metadata/owner_bootstrap');
 await db.runTransaction(async tx=>{
  const marker=await tx.get(lock),owners=await tx.get(db.collection('users').where('role','==','owner').limit(1)),profile=await tx.get(user);
  if(marker.exists||!owners.empty)throw new Error('owner-already-initialized');
  if(!profile.exists||profile.data().status!=='pending'||!['customer','employee'].includes(profile.data().requestedRole))throw new Error('pending-profile-required');
  if(profile.data().email!==account.email)throw new Error('profile-auth-email-mismatch');
  const now=serverTimestamp();
  tx.update(user,{role:'owner',status:'active',permissions:[],updatedAt:now,reviewedBy:'emulator-bootstrap'});
  tx.create(lock,{uid,createdAt:now,mode:'emulator-rehearsal'});
  tx.create(db.collection('audit_logs').doc(),{actorUid:'emulator-bootstrap',action:'owner.bootstrap.rehearsal',targetUid:uid,before:{role:profile.data().role,status:profile.data().status},after:{role:'owner',status:'active'},createdAt:now});
 });
 return {uid,mode:'emulator-rehearsal'};
}
