import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// 🔹 Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyBJ1UGX6XNIhRSPedPbm9NBuM-rS6fdrwo",
  authDomain: "avenirstage-75a78.firebaseapp.com",
  projectId: "avenirstage-75a78",
  storageBucket: "avenirstage-75a78.appspot.com",
  messagingSenderId: "486755613692",
  appId: "1:486755613692:web:0d5c3b3bbbe8bd90021079"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const chatDiv = document.getElementById("chat");
const messagesRef = collection(db, "chatMessages");

// 監聽已批准留言，按時間降序（最新在上）
const approvedQuery = query(messagesRef, where("approved", "==", true), orderBy("timestamp", "desc"));

onSnapshot(approvedQuery, snapshot => {
  const messages = [];
  snapshot.forEach(doc => {
    messages.push(doc.data());
  });

  // 只保留最新 10 條
  const latest = messages.slice(0, 10);

  chatDiv.innerHTML = "";
  latest.forEach(msg => {
    const div = document.createElement("div");
    div.className = "chat-message";
    div.textContent = msg.text; // 不顯示使用者名稱
    chatDiv.appendChild(div);
  });
});
