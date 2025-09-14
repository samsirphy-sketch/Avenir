// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { 
  getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

let db;

export function initFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyBJ1UGX6XNIhRSPedPbm9NBuM-rS6fdrwo",
    authDomain: "avenirstage-75a78.firebaseapp.com",
    projectId: "avenirstage-75a78",
    storageBucket: "avenirstage-75a78.appspot.com",
    messagingSenderId: "486755613692",
    appId: "1:486755613692:web:0d5c3b3bbbe8bd90021079"
  };
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

// 使用者送出留言（預設 approved: false）
export async function sendMessage(collectionName, text) {
  if (!db) return;
  await addDoc(collection(db, collectionName), {
  text,
  approved: false,
  timestamp: serverTimestamp(), // 真正排序用
  createdAt: new Date()         // 預設本機時間，避免暫時 null
  });
}

// 監聽已批准留言（index.html）
export function listenApprovedMessages(collectionName, limit, callback) {
  if (!db) return;
  const messagesRef = collection(db, collectionName);
  const q = query(messagesRef, where("approved", "==", true), orderBy("timestamp", "asc"));
  onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    callback(messages.slice(0, limit));
  });
}

// 監聽未批准留言（admin.html）
export function listenPendingMessages(collectionName, callback) {
  if (!db) return;
  const messagesRef = collection(db, collectionName);
  const q = query(messagesRef, where("approved", "==", false), orderBy("timestamp", "asc"));
  onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    callback(messages);
  });
}

// 批准留言
export async function approveMessage(collectionName, id) {
  if (!db) return;
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, { approved: true });
}

// 拒絕留言
export async function rejectMessage(collectionName, id) {
  if (!db) return;
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}


