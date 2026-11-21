import {collection,query,where,limit,onSnapshot} from 'firebase/firestore';
import {httpsCallable} from 'firebase/functions';
import {db,functions} from '../config/firebase.js';
export function watchPendingAccounts(next,error){
 return onSnapshot(query(collection(db,'users'),where('status','==','pending'),limit(100)),snapshot=>next(snapshot.docs.map(doc=>({...doc.data(),uid:doc.id}))),error);
}
export async function decidePendingAccount({uid,status,role,permissions}){
 return httpsCallable(functions,'reviewUser')({uid,status,role,permissions,expectedStatus:'pending'});
}
