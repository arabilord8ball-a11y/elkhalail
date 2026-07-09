import { useState, useEffect } from 'react';
import { FiSend, FiPaperclip, FiSmile, FiTrash2 } from 'react-icons/fi';
import AdminLayout from '../../components/layout/AdminLayout';
import { getStoredChats, saveStoredChats, deleteStoredChat, saveSingleChat } from '../../utils/storage';
import { useRef } from 'react';
import './AdminTable.css';

export default function Chat() {
  const [conversations, setConversations] = useState(() => getStoredChats());
  const [activeChat, setActiveChat] = useState(() => conversations[0] || null);
  const [input, setInput] = useState('');
  const chatMessagesRef = useRef(null);

  const handleDeleteChat = (id) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteStoredChat(id);
      if (activeChat && activeChat.id === id) {
        setActiveChat(null);
      }
      setConversations(getStoredChats());
    }
  };

  useEffect(() => {
    const handleSync = () => {
      const chats = getStoredChats();
      setConversations(chats);
      if (activeChat) {
        const updatedActive = chats.find(c => c.id === activeChat.id);
        if (updatedActive) {
          setActiveChat(updatedActive);
        }
      } else if (chats.length > 0) {
        setActiveChat(chats[0]);
      }
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('live-chat-update', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('live-chat-update', handleSync);
    };
  }, [activeChat, conversations]);

  // Auto-scroll admin chat container
  useEffect(() => {
    if (activeChat && chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [activeChat?.messages?.length, activeChat?.id]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;

    const newMsg = { 
      from: 'admin', 
      text: input, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };

    const updatedChat = { 
      ...activeChat, 
      messages: [...(activeChat.messages || []), newMsg], 
      unread: 0 
    };
    
    setConversations(conversations.map(c => c.id === activeChat.id ? updatedChat : c));
    saveSingleChat(updatedChat);
    setActiveChat(updatedChat);
    setInput('');
    window.dispatchEvent(new Event('live-chat-update'));
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div><h1>Chat</h1><p>Guest messaging</p></div>
        </div>

        <div className="chat-layout">
          {/* Chat List */}
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <h3>Messages</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <span className="badge badge-red">{conversations.filter(c => c.unread > 0).length} Unread</span>
                <span className="badge badge-gray">Closed</span>
              </div>
            </div>
            <div className="chat-list">
              {(conversations || []).map(chat => (
                <div
                  key={chat.id}
                  className={`chat-item ${activeChat && activeChat.id === chat.id ? 'active' : ''}`}
                  onClick={() => setActiveChat(chat)}
                >
                  <div className="rb-avatar" style={{ position: 'relative' }}>
                    {chat.avatar}
                    <span className={`chat-status-dot ${chat.status?.toLowerCase() || 'offline'}`} style={{ position: 'absolute', bottom: 0, right: 0 }} />
                  </div>
                  <div className="chat-item-info">
                    <div className="chat-item-name">{chat.guest}</div>
                    <div className="chat-item-preview">{chat.messages?.[chat.messages?.length - 1]?.text}</div>
                  </div>
                  <div className="chat-item-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div className="chat-time">{chat.messages?.[chat.messages?.length - 1]?.time}</div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {chat.unread > 0 && <div className="chat-unread">{chat.unread}</div>}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.7
                        }}
                        title="Delete Conversation"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Main */}
          {activeChat ? (
            <div className="chat-main">
              <div className="chat-main-header">
                <div className="chat-user-info">
                  <div className="rb-avatar">{activeChat.avatar}</div>
                  <div>
                    <div className="chat-user-name">{activeChat.guest}</div>
                    <div className="chat-user-booking">
                      <span className={`chat-status-dot ${activeChat.status?.toLowerCase() || 'offline'}`} />
                      {activeChat.status} · Booking {activeChat.booking}
                    </div>
                  </div>
                </div>
                <a href="#" style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>View Booking</a>
              </div>

              <div className="chat-messages" ref={chatMessagesRef}>
                {(activeChat.messages || []).map((msg, i) => (
                  <div key={i} className={`chat-message ${msg.from}`}>
                    <div className="msg-bubble">{msg.text}</div>
                    <div className="msg-time">{msg.time}</div>
                  </div>
                ))}
              </div>

              <form className="chat-input-bar" onSubmit={sendMessage}>
                <button type="button" className="chat-icon-btn"><FiPaperclip /></button>
                <button type="button" className="chat-icon-btn"><FiSmile /></button>
                <input
                  className="chat-input"
                  placeholder="Type your message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                />
                <button type="submit" className="chat-send-btn"><FiSend /></button>
              </form>
            </div>
          ) : (
            <div className="chat-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', flexDirection: 'column', gap: '10px' }}>
              <FiSend size={40} style={{ opacity: 0.5 }} />
              <div style={{ fontWeight: 600, fontSize: '15px' }}>No conversation selected</div>
              <div style={{ fontSize: '12px' }}>Choose a guest message from the list to reply.</div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
