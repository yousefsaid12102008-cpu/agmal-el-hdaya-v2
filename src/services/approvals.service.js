import {collection,query,where,limit,onSnapshot} from 'firebase/firestore';
import {reviewProfile} from './profile-transactions.js';
import {db,auth} from '../config/firebase.js';
export function watchPendingAccounts(next,error){
 return onSnapshot(query(collection(db,'users'),where('status','==','pending'),limit(100)),snapshot=>next(snapshot.docs.map(doc=>({...doc.data(),uid:doc.id}))),error);
}
export async function decidePendingAccount({uid,status,role,permissions}){
 return reviewProfile(db,auth.currentUser?.uid,{uid,status,role,permissions},'pending');
}
