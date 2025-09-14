import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, onSnapshot, doc, updateDoc } 
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

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

// 查詢未批准留言，按 timestamp 降序（最新在上）
const pendingQuery = query(
  messagesRef,
  where("approved", "==", false),
  orderBy("timestamp", "desc")
);

onSnapshot(pendingQuery, (snapshot) => {
  const messages = [];
  snapshot.forEach((docItem) => {
    messages.push({ id: docItem.id, ...docItem.data() });
  });

  // 只保留最新 10 條
  const latest = messages.slice(0, 10);

  chatDiv.innerHTML = ""; // 清空
  latest.forEach(msg => {
    const div = document.createElement("div");
    div.className = "chat-message";
    div.textContent = msg.text;

    const approveBtn = document.createElement("button");
    approveBtn.textContent = "批准";
    approveBtn.addEventListener("click", async () => {
      const msgDoc = doc(db, "chatMessages", msg.id);
      await updateDoc(msgDoc, { approved: true });
    });

    div.appendChild(approveBtn);
    chatDiv.appendChild(div);
  });
});
