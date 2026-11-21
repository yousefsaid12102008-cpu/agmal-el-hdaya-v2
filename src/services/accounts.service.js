import {collection,query,orderBy,documentId,limit,startAfter,getDocs,getDoc,doc,getCountFromServer} from 'firebase/firestore';
import {db,auth} from '../config/firebase.js';
import {reviewProfile} from './profile-transactions.js';
export async function accountPage(after){const constraints=[orderBy(documentId()),limit(50)];if(after)constraints.push(startAfter(after));const snapshot=await getDocs(query(collection(db,'users'),...constraints));return {items:snapshot.docs.map(d=>({...d.data(),uid:d.id})),cursor:snapshot.docs.at(-1)?.id,more:snapshot.size===50};}
export async function accountTotal(){return (await getCountFromServer(collection(db,'users'))).data().count;}
export async function setAccountAccess(p,status){return reviewProfile(db,auth.currentUser?.uid,{uid:p.uid,status,role:p.role,permissions:p.permissions},p.status);}

export async function loginActivity(uid){const snapshot=await getDoc(doc(db,'login_activity',uid));return snapshot.exists()?snapshot.data():null;}
