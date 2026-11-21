import {doc,setDoc,serverTimestamp} from 'firebase/firestore';
import {deviceLabel} from '../utils/device.js';
import {signInWithEmailAndPassword,createUserWithEmailAndPassword,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged,sendPasswordResetEmail,sendEmailVerification,reload} from 'firebase/auth';
import {registerProfile} from './profile-transactions.js';
import {auth,db,configured} from '../config/firebase.js';
import {profileRequest} from '../utils/auth-request.js';
const ready=()=>{if(!configured)throw new Error('setup-required');};
export const watchAuth=(callback)=>{if(!configured){callback(null);return ()=>{};}return onAuthStateChanged(auth,callback);};
export async function login(email,password){ready();await signInWithEmailAndPassword(auth,email,password);await ensureProfile();await recordLogin();}
export async function requestAccount(email,password,requestedRole='customer'){ready();await createUserWithEmailAndPassword(auth,email,password);await ensureProfile(requestedRole);await recordLogin();return sendVerification();}
export async function googleLogin(requestedRole='customer'){ready();await signInWithPopup(auth,new GoogleAuthProvider());await ensureProfile(requestedRole);await recordLogin();}
export async function ensureProfile(requestedRole='customer'){ready();return registerProfile(db,auth.currentUser,profileRequest(requestedRole).requestedRole);}
export async function logout(){ready();return signOut(auth);}
export async function resetPassword(email){ready();return sendPasswordResetEmail(auth,email);}

export async function sendVerification(){ready();if(auth.currentUser&&!auth.currentUser.emailVerified)return sendEmailVerification(auth.currentUser);}
export async function recheckVerification(){ready();await reload(auth.currentUser);await auth.currentUser.getIdToken(true);if(!auth.currentUser.emailVerified)return false;await ensureProfile();return true;}

async function recordLogin(){try{const label=await deviceLabel();const user=auth.currentUser,token=await user.getIdTokenResult();const authTime=token.claims.auth_time;await setDoc(doc(db,'login_events',user.uid,'events',String(authTime)),{authTime,recordedAt:serverTimestamp(),deviceLabel:label,source:'client-reported'});}catch{console.warn('Login activity unavailable');}}
