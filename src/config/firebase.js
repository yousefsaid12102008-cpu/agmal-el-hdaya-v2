import {initializeApp} from 'firebase/app';
import {getAuth, connectAuthEmulator} from 'firebase/auth';
import {getFirestore, connectFirestoreEmulator} from 'firebase/firestore';
import {initializeAppCheck, ReCaptchaEnterpriseProvider} from 'firebase/app-check';
const env=import.meta.env;
const config={apiKey:env.VITE_FIREBASE_API_KEY,authDomain:env.VITE_FIREBASE_AUTH_DOMAIN,projectId:env.VITE_FIREBASE_PROJECT_ID,appId:env.VITE_FIREBASE_APP_ID};
export const configured=Object.values(config).every(Boolean);
export let auth=null,db=null;
if(configured){
 const app=initializeApp(config);
 if(env.VITE_FIREBASE_APPCHECK_SITE_KEY) initializeAppCheck(app,{provider:new ReCaptchaEnterpriseProvider(env.VITE_FIREBASE_APPCHECK_SITE_KEY),isTokenAutoRefreshEnabled:true});
 auth=getAuth(app); db=getFirestore(app);
 if(env.DEV && env.VITE_FIREBASE_USE_EMULATORS==='true'){
  connectAuthEmulator(auth,'http://127.0.0.1:9199',{disableWarnings:true}); connectFirestoreEmulator(db,'127.0.0.1',8180);
 }
}
