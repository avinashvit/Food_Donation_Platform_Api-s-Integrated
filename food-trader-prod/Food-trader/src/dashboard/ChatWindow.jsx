// src/dashboard/ChatWindow.jsx (FINAL FIX)

import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { db, admin } from '../firebaseConfig'; 
import './Dashboard.css';

const ChatWindow = ({ donationId, participantRole }) => {
    const { user, isAuthenticated, isLoading } = useAuth0(); 
    
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(true); // New state to track subscription status
    const messagesEndRef = useRef(null);

    // 1. Fetch messages for this specific donation ID and listen for updates
    useEffect(() => {
        if (isLoading || !user) return; 

        setIsSubscribing(true);

        const chatRef = db.collection('chats')
            .where('donationId', '==', donationId)
            .orderBy('timestamp', 'asc');

        const unsubscribe = chatRef.onSnapshot(snapshot => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
            setIsSubscribing(false);
        }, error => {
            console.error("Firestore subscription error (Check Rules and Network):", error);
            setIsSubscribing(false);
            alert("Error connecting to chat. Check console for network blockages.");
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, [donationId, isLoading, user]); 

    // Scroll to the bottom whenever a new message arrives
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 2. Handle sending the message
    const handleSend = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        if (!isAuthenticated) {
            alert("Authentication required to send a message.");
            return;
        }

        const senderName = user.nickname || user.name || 'Anonymous'; 

        const messageData = {
            donationId,
            senderId: user.sub,
            senderName: senderName,
            message: newMessage.trim(),
            timestamp: admin.firestore.FieldValue.serverTimestamp(), 
            role: participantRole
        };

        try {
            await db.collection('chats').add(messageData);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message. Check your console and Firebase rules.");
        }
    };

    if (isLoading) {
        return <div className="chat-window">Connecting to Authentication Service...</div>;
    }
    
    if (isSubscribing) {
        return <div className="chat-window">Establishing Realtime Connection... (If stuck, check browser extensions)</div>;
    }
    
    if (!isAuthenticated) {
        return <div className="chat-window">Authentication required for chat.</div>;
    }

    return (
        <div className="chat-window">
            <div className="chat-header">Chat for Donation ID: {donationId}</div>
            <div className="messages-container">
                {messages.map(msg => (
                    <div 
                        key={msg.id} 
                        className={`message ${msg.senderId === user.sub ? 'sent' : 'received'}`}
                    >
                        <strong>{msg.senderName} ({msg.role}):</strong> {msg.message}
                        <span className="timestamp">
                           {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString() : '...'}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="message-input-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={!isAuthenticated} 
                />
                <button type="submit" disabled={!isAuthenticated || newMessage.trim() === ''}>Send</button>
            </form>
        </div>
    );
};

export default ChatWindow;