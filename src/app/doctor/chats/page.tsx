"use client";

import { useState, useRef, useEffect } from "react";
import {
   Search, MessageSquare, Clock, Send, Mic,
   ChevronLeft, Phone, Video, MoreVertical,
   CheckCheck, Paperclip, Plus,
   Image as ImageIcon
} from "lucide-react";

export default function DoctorChatsPage() {
   const [selectedSession, setSelectedSession] = useState<any>(null);
   const [input, setInput] = useState("");
   const [searchTerm, setSearchTerm] = useState("");
   const scrollRef = useRef<HTMLDivElement>(null);

   const sessions = [
      { id: 1, name: "Somchai Jaidee", hn: "HN-00123", lastMsg: "Doctor, my medication is running low.", time: "09:45", unread: 2, status: "online" },
      { id: 2, name: "Wiphada Rakdee", hn: "HN-00555", lastMsg: "Sent the lab results as requested.", time: "Yesterday", unread: 0, status: "offline" },
   ];

   const messages = [
      { id: 1, role: "patient", content: "Hello Doctor, good morning.", time: "09:30" },
      { id: 2, role: "doctor", content: "Good morning Khun Somchai. Any additional symptoms today?", time: "09:32" },
      { id: 3, role: "patient", content: "I'm feeling a bit dizzy today.", time: "09:35" },
      { id: 4, role: "patient", content: "Sending a photo of the medication I'm currently taking.", time: "09:40", type: "IMAGE", url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400" },
   ];

   const filtered = sessions.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.hn.toLowerCase().includes(searchTerm.toLowerCase())
   );

   useEffect(() => {
      if (scrollRef.current) {
         scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
   }, [selectedSession, messages.length]);

   // ── shared avatar style ──────────────────────────────────────────
   const avatarBase = (size: number, bg: string, color: string): React.CSSProperties => ({
      width: size, height: size, borderRadius: '50%',
      background: bg, color, border: '1px solid #E5E7EB',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 600, fontSize: size > 40 ? '14px' : '12px',
      flexShrink: 0,
   });

   const iconBtn: React.CSSProperties = {
      background: '#F9FAFB', border: '1px solid #E5E7EB',
      borderRadius: '50%', width: '34px', height: '34px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', color: '#6B7280', flexShrink: 0,
   };

   return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px - 64px)', marginTop: '-32px' }}>
         <div style={{
            flex: 1,
            display: 'flex',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            overflow: 'hidden',
            minHeight: 0,
         }}>

            {/* ══════════════════ SESSION LIST ══════════════════ */}
            <div style={{
               width: '300px',
               flexShrink: 0,
               borderRight: '1px solid #E5E7EB',
               display: selectedSession ? 'none' : 'flex',
               flexDirection: 'column',
               background: '#FCFCFD',
            }}
               className="chat-sidebar"
            >
               {/* Sidebar Header */}
               <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB', background: '#FFFFFF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                     <span style={{ fontSize: '11px', fontWeight: 600, color: '#374151', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        Clinical Messenger
                     </span>
                     <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Plus size={12} /> New
                     </button>
                  </div>

                  {/* Search */}
                  <div style={{
                     display: 'flex', alignItems: 'center', gap: '8px',
                     background: '#F3F4F6', border: '1px solid #E5E7EB',
                     borderRadius: '4px', padding: '7px 12px',
                  }}>
                     <Search size={13} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                     <input
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', flex: 1, color: '#1F2937' }}
                     />
                  </div>
               </div>

               {/* Session List */}
               <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
                  {filtered.map(s => {
                     const active = selectedSession?.id === s.id;
                     return (
                        <div
                           key={s.id}
                           onClick={() => setSelectedSession(s)}
                           style={{
                              display: 'flex', alignItems: 'center', gap: '12px',
                              padding: '14px 16px',
                              borderBottom: '1px solid #F3F4F6',
                              borderLeft: active ? '3px solid #0A5C8E' : '3px solid transparent',
                              background: active ? '#E8F0F5' : 'transparent',
                              cursor: 'pointer',
                              transition: 'background 0.15s ease',
                              position: 'relative',
                           }}
                           onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F9FAFB'; }}
                           onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                        >
                           {/* Avatar + online dot */}
                           <div style={{ position: 'relative', flexShrink: 0 }}>
                              <div style={avatarBase(44, '#F3F4F6', '#0A5C8E')}>
                                 {s.name.charAt(0)}
                              </div>
                              <div style={{
                                 position: 'absolute', bottom: 0, right: 0,
                                 width: '10px', height: '10px', borderRadius: '50%',
                                 background: s.status === 'online' ? '#059669' : '#D1D5DB',
                                 border: '2px solid white',
                              }} />
                           </div>

                           {/* Info */}
                           <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                                 <span style={{ fontSize: '13px', fontWeight: 500, color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {s.name}
                                 </span>
                                 <span style={{ fontSize: '10px', color: '#9CA3AF', flexShrink: 0, marginLeft: '8px' }}>
                                    {s.time}
                                 </span>
                              </div>
                              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                 {s.lastMsg}
                              </p>
                           </div>

                           {/* Unread badge */}
                           {s.unread > 0 && (
                              <div style={{
                                 width: '18px', height: '18px', borderRadius: '50%',
                                 background: '#0A5C8E', color: 'white',
                                 fontSize: '10px', fontWeight: 600,
                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                                 flexShrink: 0,
                              }}>
                                 {s.unread}
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* ══════════════════ CHAT AREA ══════════════════ */}
            <div style={{
               flex: 1,
               display: (!selectedSession ? 'none' : 'flex'),
               flexDirection: 'column',
               background: '#FFFFFF',
               minWidth: 0,
            }}
               className="chat-main"
            >
               {selectedSession ? (
                  <>
                     {/* Chat Header */}
                     <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 20px', borderBottom: '1px solid #E5E7EB',
                        background: '#FFFFFF', flexShrink: 0,
                     }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           {/* Back button (mobile) */}
                           <button
                              onClick={() => setSelectedSession(null)}
                              style={{ ...iconBtn, display: 'none' }}
                              className="chat-back-btn"
                           >
                              <ChevronLeft size={18} />
                           </button>

                           <div style={avatarBase(38, '#E8F0F5', '#0A5C8E')}>
                              {selectedSession.name.charAt(0)}
                           </div>

                           <div>
                              <div style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>
                                 {selectedSession.name}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                 <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
                                 <span style={{ fontSize: '11px', color: '#6B7280' }}>
                                    {selectedSession.hn} · Active Session
                                 </span>
                              </div>
                           </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                           <button style={iconBtn}><Phone size={15} /></button>
                           <button style={iconBtn}><Video size={15} /></button>
                           <button style={iconBtn}><MoreVertical size={15} /></button>
                        </div>
                     </div>

                     {/* Messages */}
                     <div
                        ref={scrollRef}
                        style={{
                           flex: 1, overflowY: 'auto', padding: '24px 20px',
                           display: 'flex', flexDirection: 'column', gap: '16px',
                           background: '#F9FAFB',
                        }}
                        className="custom-scrollbar"
                     >
                        {messages.map(m => {
                           const isDoctor = m.role === 'doctor';
                           return (
                              <div
                                 key={m.id}
                                 style={{
                                    display: 'flex',
                                    justifyContent: isDoctor ? 'flex-end' : 'flex-start',
                                    alignItems: 'flex-end',
                                    gap: '8px',
                                 }}
                              >
                                 {/* Patient avatar */}
                                 {!isDoctor && (
                                    <div style={avatarBase(28, '#F3F4F6', '#6B7280')}>P</div>
                                 )}

                                 <div style={{ maxWidth: '68%', display: 'flex', flexDirection: 'column', alignItems: isDoctor ? 'flex-end' : 'flex-start' }}>
                                    <div style={{
                                       padding: '10px 14px',
                                       background: isDoctor ? '#0A5C8E' : '#FFFFFF',
                                       color: isDoctor ? '#FFFFFF' : '#1F2937',
                                       borderRadius: isDoctor ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                       border: isDoctor ? 'none' : '1px solid #E5E7EB',
                                       fontSize: '13px',
                                       lineHeight: 1.5,
                                    }}>
                                       {m.type === 'IMAGE' ? (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                             <img
                                                src={m.url}
                                                alt="Sent"
                                                style={{ maxHeight: '220px', width: '100%', objectFit: 'cover', borderRadius: '6px' }}
                                             />
                                             <p style={{ margin: 0, fontSize: '12px' }}>{m.content}</p>
                                          </div>
                                       ) : (
                                          <p style={{ margin: 0 }}>{m.content}</p>
                                       )}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', padding: '0 2px' }}>
                                       <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{m.time}</span>
                                       {isDoctor && <CheckCheck size={11} style={{ color: '#0A5C8E' }} />}
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>

                     {/* Input Area */}
                     <div style={{
                        padding: '16px 20px', borderTop: '1px solid #E5E7EB',
                        background: '#FFFFFF', flexShrink: 0,
                     }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           {/* Attachment buttons */}
                           <div style={{ display: 'flex', gap: '6px' }}>
                              <button style={iconBtn}><Paperclip size={16} /></button>
                              <button style={iconBtn}><Mic size={16} /></button>
                           </div>

                           {/* Input */}
                           <div style={{ flex: 1, position: 'relative' }}>
                              <input
                                 type="text"
                                 placeholder="Type clinical response..."
                                 value={input}
                                 onChange={e => setInput(e.target.value)}
                                 onKeyDown={e => { if (e.key === 'Enter' && input.trim()) setInput(""); }}
                                 style={{
                                    width: '100%', padding: '10px 44px 10px 16px',
                                    border: '1px solid #E5E7EB', borderRadius: '20px',
                                    background: '#F9FAFB', fontSize: '13px',
                                    outline: 'none', color: '#1F2937',
                                 }}
                              />
                              <button style={{
                                 position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                 background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF',
                                 display: 'flex', alignItems: 'center', padding: 0,
                              }}>
                                 <ImageIcon size={16} />
                              </button>
                           </div>

                           {/* Send */}
                           <button
                              style={{
                                 width: '42px', height: '42px', borderRadius: '50%',
                                 background: input.trim() ? '#0A5C8E' : '#E5E7EB',
                                 border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                                 transition: 'background 0.15s ease', flexShrink: 0,
                              }}
                              onClick={() => { if (input.trim()) setInput(""); }}
                           >
                              <Send size={17} style={{ color: input.trim() ? 'white' : '#9CA3AF' }} />
                           </button>
                        </div>
                     </div>
                  </>
               ) : (
                  /* Empty State */
                  <div style={{
                     flex: 1, display: 'flex', flexDirection: 'column',
                     alignItems: 'center', justifyContent: 'center',
                     textAlign: 'center', padding: '40px', opacity: 0.5,
                  }}>
                     <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: '#E8F0F5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '20px',
                     }}>
                        <MessageSquare size={36} style={{ color: '#0A5C8E' }} />
                     </div>
                     <div style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937', marginBottom: '8px' }}>
                        Secure Messenger Active
                     </div>
                     <p style={{ fontSize: '12px', color: '#6B7280', maxWidth: '280px', lineHeight: 1.6, margin: 0 }}>
                        Select a patient session to initialize secure end-to-end clinical communication.
                     </p>
                  </div>
               )}
            </div>
         </div>

         <style>{`
        /* Show sidebar always on desktop */
        @media (min-width: 769px) {
          .chat-sidebar { display: flex !important; }
          .chat-main    { display: flex !important; }
          .chat-back-btn { display: none !important; }
        }
        /* Mobile: toggle panels */
        @media (max-width: 768px) {
          .chat-sidebar { width: 100% !important; }
          .chat-back-btn { display: flex !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }
      `}</style>
      </div>
   );
}