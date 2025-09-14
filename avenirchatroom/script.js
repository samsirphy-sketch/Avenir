// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let adminMode = false;

function startAdminMode() { adminMode = true; loadMessages(); }
function startUserMode() { adminMode = false; loadMessages(); }

if (!adminMode) {
  document.getElementById("sendBtn").onclick = () => {
    const text = document.getElementById("msgInput").value;
    if (!text) return;
    db.collection("messages").add({
      text: text,
      approved: false,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById("msgInput").value = "";
  }
}

function loadMessages() {
  if (adminMode) {
    db.collection("messages").orderBy("timestamp").onSnapshot(snapshot => {
      const list = document.getElementById("approvalList");
      list.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.approved) {
          const div = document.createElement("div");
          div.className = "message";
          div.textContent = data.text;
          const btn = document.createElement("button");
          btn.className = "approveBtn";
          btn.textContent = "批准";
          btn.onclick = () => {
            db.collection("messages").doc(doc.id).update({ approved: true });
          };
          div.appendChild(btn);
          list.appendChild(div);
        }
      });
    });
  } else {
    db.collection("messages").where("approved", "==", true).orderBy("timestamp")
      .onSnapshot(snapshot => {
        const box = document.getElementById("chatbox");
        box.innerHTML = "";
        snapshot.forEach(doc => {
          const data = doc.data();
          const div = document.createElement("div");
          div.className = "message";
          div.textContent = data.text;
          box.appendChild(div);
        });
      });
  }
}

if (!adminMode) startUserMode();
