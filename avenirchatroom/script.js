// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { 
  getFirestore, collection, query, where, orderBy, onSnapshot, 
  addDoc, doc, updateDoc, deleteDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

let db;
const DEFAULT_COLLECTION = "chatMessages"; // 🔹 預設集合名

// 初始化 Firebase
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
export async function sendMessage(text) {
  if (!db) return;
  await addDoc(collection(db, DEFAULT_COLLECTION), {
    text,
    approved: false,
    timestamp: serverTimestamp(), // 🔹 用 serverTimestamp 排序
    createdAt: new Date()         // 🔹 本地時間備用，避免 timestamp 為 null
  });
}

// 監聽已批准留言（index.html 用）
export function listenApprovedMessages(limit, callback) {
  if (!db) return;
  const messagesRef = collection(db, DEFAULT_COLLECTION);
  const q = query(
    messagesRef,
    where("approved", "==", true),
    orderBy("timestamp", "asc") // 🔹 依時間正序
  );
  onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    callback(messages.slice(-limit)); // 只取最新 limit 條
  });
}

// 監聽待審批留言（admin.html 用）
export function listenPendingMessages(callback) {
  if (!db) return;
  const messagesRef = collection(db, DEFAULT_COLLECTION);
  const q = query(
    messagesRef,
    where("approved", "==", false),
    orderBy("timestamp", "asc")
  );
  onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    callback(messages);
  });
}

// 批准留言
export async function approveMessage(id) {
  if (!db) return;
  const docRef = doc(db, DEFAULT_COLLECTION, id);
  await updateDoc(docRef, { approved: true });
}

// 拒絕留言
export async function rejectMessage(id) {
  if (!db) return;
  const docRef = doc(db, DEFAULT_COLLECTION, id);
  await deleteDoc(docRef);
}
