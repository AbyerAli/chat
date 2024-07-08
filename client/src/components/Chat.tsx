import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

// Replace with the actual server URL
const SERVER_URL = 'http://localhost:3005';

interface IMessage {
  user: string;
  text: string;
  time: string;
}

const Chat = ({ username }: { username: string }) => {
  const [message, setMessage] = useState<string>('');
  const [chat, setChat] = useState<IMessage[]>([]);

  // Initialize socket connection
  const socket: Socket = io(SERVER_URL, {
    auth: {
      token: "YourAuthToken" // Replace with your auth token
    }
  });

  // Function to send a message
  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim()) {
      const messageData: IMessage = {
        user: username,
        text: message,
        time: new Date().toISOString()
      };
      socket.emit('chat message', messageData);
      setMessage('');
    }
  };

  // Effect to listen for incoming messages
  useEffect(() => {
    socket.on('chat message', (messageData: IMessage) => {
      setChat((prevChat) => [...prevChat, messageData]);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Chat Room</h2>
      <ul id="messages">
        {chat.map((messageData, index) => (
          <li key={index}>
            <strong>{messageData.user}</strong>: {messageData.text} <em>{new Date(messageData.time).toLocaleTimeString()}</em>
          </li>
        ))}
      </ul>
      <form id="form" onSubmit={sendMessage}>
        <input
          id="input"
          autoComplete="off"
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
          style={{ background: 'black' }}
        />
        <button type="submit" className='border border-sky-500 rounded-md p-2 ml-3'>Send</button>
      </form>
    </div>
  );
};

export default Chat;