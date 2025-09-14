// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const server = http.createServer(app);

// Env: ADMIN_TOKEN (set locally or in deployment platform)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change_this_token';

// serve static files from /public
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Simple in-memory store (use DB in production)
const messages = []; // { id, text, author, approved: false, time }

// optional API to fetch approved messages (for debug)
app.get('/api/approved', (req, res) => {
  res.json(messages.filter(m => m.approved));
});

const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', socket => {
  const role = socket.handshake.query.role || 'viewer';
  console.log('conn', socket.id, 'role=', role);

  // send current approved messages to overlay or any client that asks
  socket.on('fetchApproved', () => {
    socket.emit('approvedList', messages.filter(m => m.approved));
  });

  // viewer submits message
  socket.on('submitMessage', data => {
    if (!data || !data.text) return;
    const msg = {
      id: nanoid(8),
      text: String(data.text).substring(0, 500),
      author: data.author ? String(data.author).substring(0,50) : '匿名',
      approved: false,
      time: Date.now()
    };
    messages.push(msg);

    // notify admins about new pending message
    io.emit('pendingListUpdate', messages.filter(m => !m.approved));
  });

  // admin requests list of pending messages (requires token)
  socket.on('fetchPending', token => {
    if (token !== ADMIN_TOKEN) {
      socket.emit('authError', 'invalid token');
      return;
    }
    socket.emit('pendingList', messages.filter(m => !m.approved));
  });

  // admin approves a message
  socket.on('approve', ({ id, token }) => {
    if (token !== ADMIN_TOKEN) {
      socket.emit('authError', 'invalid token');
      return;
    }
    const idx = messages.findIndex(m => m.id === id);
    if (idx === -1) return;
    messages[idx].approved = true;
    // broadcast the single approved message to overlay and all listeners
    io.emit('approved', messages[idx]);
    // update pending lists in admin clients
    io.emit('pendingListUpdate', messages.filter(m => !m.approved));
  });

  // admin dismiss (delete) message
  socket.on('dismiss', ({ id, token }) => {
    if (token !== ADMIN_TOKEN) {
      socket.emit('authError', 'invalid token');
      return;
    }
    const idx = messages.findIndex(m => m.id === id);
    if (idx === -1) return;
    messages.splice(idx, 1);
    io.emit('pendingListUpdate', messages.filter(m => !m.approved));
  });

  socket.on('disconnect', () => {
    // console.log('disconnect', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on :${PORT}`));
