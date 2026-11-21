import {signInWithEmailAndPassword,createUserWithEmailAndPassword,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged,sendPasswordResetEmail} from 'firebase/auth';
import {registerProfile} from './profile-transactions.js';
import {auth,db,configured} from '../config/firebase.js';
import {profileRequest} from '../utils/auth-request.js';
const ready=()=>{if(!configured)throw new Error('setup-required');};
export const watchAuth=(callback)=>{if(!configured){callback(null);return ()=>{};}return onAuthStateChanged(auth,callback);};
export async function login(email,password){ready();await signInWithEmailAndPassword(auth,email,password);return ensureProfile();}
export async function requestAccount(email,password,requestedRole='customer'){ready();await createUserWithEmailAndPassword(auth,email,password);return ensureProfile(requestedRole);}
export async function googleLogin(requestedRole='customer'){ready();await signInWithPopup(auth,new GoogleAuthProvider());return ensureProfile(requestedRole);}
export async function ensureProfile(requestedRole='customer'){ready();return registerProfile(db,auth.currentUser,profileRequest(requestedRole).requestedRole);}
export async function logout(){ready();return signOut(auth);}
export async function resetPassword(email){ready();return sendPasswordResetEmail(auth,email);}
