import {doc,onSnapshot} from 'firebase/firestore';
import {db} from '../config/firebase.js';
export function watchProfile(uid,next,error){return onSnapshot(doc(db,'users',uid),snapshot=>next(snapshot.exists()?snapshot.data():null),error);}
