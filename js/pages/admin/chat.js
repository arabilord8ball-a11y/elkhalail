/**
 * ELKHALIL HOTEL — Admin Live Chat Page
 * Ported from Chat.jsx
 */

window.renderChatPage = function() {
  document.title = 'Live Chat — Admin Panel';
  let chats = window.getStoredChats() || [];
  let selectedChatId = '';
  let activeMessages = [];

  const renderChatListItems = () => {
    return chats.map(chat => `
      <div class="chat-list-item ${chat.id === selectedChatId ? 'active' : ''} ${chat.unread > 0 ? 'has-unread' : ''}" onclick="selectChatConversation('${chat.id}')">
        <div class="avatar">${(chat.guestName || 'G')[0].toUpperCase()}</div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;">
            <div style="font-weight:600;font-size:13px;color:var(--gray-800);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${chat.guestName}</div>
            <span style="font-size:10px;color:var(--gray-400);">${chat.lastMessageTime || ''}</span>
          </div>
          <div style="font-size:12px;color:var(--gray-500);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${chat.lastMessage || 'No messages'}</div>
        </div>
        ${chat.unread > 0 ? `<span class="badge badge-gold" style="border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;padding:0;">${chat.unread}</span>` : ''}
      </div>
    `).join('');
  };

  const renderActiveMessages = () => {
    return activeMessages.map(msg => {
      const isOutgoing = msg.sender === 'admin';
      return `
        <div class="chat-message ${isOutgoing ? 'outgoing' : 'incoming'}">
          <div class="chat-bubble">${msg.text || msg.message}</div>
          <div class="chat-time">${msg.time || new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      `;
    }).join('');
  };

  const renderContent = () => {
    const listEl = document.getElementById('chat-list-items');
    if (listEl) listEl.innerHTML = renderChatListItems();

    const activeChat = chats.find(c => c.id === selectedChatId);
    const windowEl = document.getElementById('chat-window-wrap');
    if (!windowEl) return;

    if (!selectedChatId || !activeChat) {
      windowEl.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:12px;color:var(--gray-400);">
          <span style="font-size:48px;">💬</span>
          <h3>Select a Conversation</h3>
          <p>Choose a guest chat thread from the left panel to begin replying.</p>
        </div>
      `;
      return;
    }

    windowEl.innerHTML = `
      <div class="chat-window">
        <div class="chat-window-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="avatar">${(activeChat.guestName || 'G')[0].toUpperCase()}</div>
            <div>
              <div style="font-weight:600;color:var(--gray-800);">${activeChat.guestName}</div>
              <div style="font-size:11px;color:var(--green);">Online</div>
            </div>
          </div>
        </div>
        <div class="chat-messages" id="chat-messages-container">
          ${renderActiveMessages()}
        </div>
        <form class="chat-input-area" onsubmit="submitAdminChatMessage(event)">
          <input type="text" class="chat-input" id="chat-admin-input" placeholder="Type a message to ${activeChat.guestName}..." autocomplete="off">
          <button type="submit" class="chat-send-btn">${window.Icons.chevronRight}</button>
        </form>
      </div>
    `;

    // Scroll to bottom
    const container = document.getElementById('chat-messages-container');
    if (container) container.scrollTop = container.scrollHeight;
  };

  const contentHtml = `
    <div class="admin-page-header">
      <div class="admin-page-header-text">
        <h1>Live Support Chat</h1>
        <p>Chat with active website guests, handle check-in queries, and resolve bookings in real-time</p>
      </div>
    </div>

    <div class="chat-layout">
      <div class="chat-list">
        <div class="chat-list-header">Conversations</div>
        <div class="chat-list-items" id="chat-list-items">
          ${renderChatListItems()}
        </div>
      </div>
      <div id="chat-window-wrap" style="display:flex;flex-direction:column;flex:1;background:var(--white);border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow-sm);">
      </div>
    </div>
  `;

  window.renderAdminPage(contentHtml, '/admin/chat');
  renderContent();

  window.selectChatConversation = async (id) => {
    selectedChatId = id;
    
    // Reset unread count locally
    const idx = chats.findIndex(c => c.id === id);
    if (idx !== -1) {
      chats[idx].unread = 0;
      await window.saveStoredChats(chats);
    }

    // Fetch conversation messages
    activeMessages = await window.getChatMessages(id);
    renderContent();
  };

  window.submitAdminChatMessage = async (e) => {
    e.preventDefault();
    const input = document.getElementById('chat-admin-input');
    const text = input?.value?.trim();
    if (!text || !selectedChatId) return;

    input.value = '';

    const newMsg = await window.sendChatMessage(selectedChatId, 'admin', text);
    if (newMsg) {
      activeMessages.push(newMsg);
      
      // Update chat preview list
      const idx = chats.findIndex(c => c.id === selectedChatId);
      if (idx !== -1) {
        chats[idx].lastMessage = text;
        chats[idx].lastMessageTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        await window.saveStoredChats(chats);
      }

      renderContent();
    }
  };

  // Real-time Chat Subscription
  let subscription = null;
  try {
    subscription = window.db.channel(`room-${selectedChatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new;
        if (newMsg.chat_id === selectedChatId) {
          activeMessages.push(newMsg);
          renderContent();
        } else {
          // Increment unread count for other threads
          const idx = chats.findIndex(c => c.id === newMsg.chat_id);
          if (idx !== -1) {
            chats[idx].unread = (chats[idx].unread || 0) + 1;
            chats[idx].lastMessage = newMsg.message;
            chats[idx].lastMessageTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            window.saveStoredChats(chats);
            const listEl = document.getElementById('chat-list-items');
            if (listEl) listEl.innerHTML = renderChatListItems();
          }
        }
      }).subscribe();
  } catch (e) {}

  window.addEventListener('live-chat-update', () => {
    chats = window.getStoredChats() || [];
    const listEl = document.getElementById('chat-list-items');
    if (listEl) listEl.innerHTML = renderChatListItems();
  });
};
