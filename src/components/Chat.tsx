import React, {useState, KeyboardEvent, RefObject} from 'react';
import './Chat.css';
import { IconButton, Box } from '@mui/material';
import { KeyboardVoiceOutlined, MicOffOutlined, Pause } from '@mui/icons-material';
import { CharacterState } from '../apis/speechRecognition';
import {COLORS} from '../pages/styles';

export interface Message {
  text: string;
  isUser: boolean;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  characterState: CharacterState;
  onMicButtonPressed: () => void;
  bars: RefObject<HTMLDivElement[]>;
}

const Chat: React.FC<ChatProps> = ({messages, onSendMessage, characterState, onMicButtonPressed, bars}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const characterStateIcon = {
    [CharacterState.Idle]: (
      <IconButton
        onClick={onMicButtonPressed}
        aria-label="Start Recording"
        sx={{
          color: COLORS.primary,
          backgroundColor: COLORS.bgcolor,
          '&:hover': {
            backgroundColor: COLORS.bgcolor,
          },
        }}>
        <KeyboardVoiceOutlined />
      </IconButton>
    ),
    [CharacterState.Listening]: (
      <IconButton
        onClick={onMicButtonPressed}
        color="error"
        aria-label="Stop Recording"
        sx={{
          backgroundColor: COLORS.bgcolor,
          '&:hover': {
            backgroundColor: COLORS.bgcolor,
          },
        }}>
        <Pause />
      </IconButton>
    ),
    [CharacterState.Speaking]: (
      <IconButton
        onClick={onMicButtonPressed}
        color="default"
        aria-label="Recording Disabled"
        sx={{
            backgroundColor: 'grey.400',
            '&:hover': {
              backgroundColor: 'grey.500',
            },
        }}>
        <MicOffOutlined />
      </IconButton>
    ),
  };


  return (
    <div className="chat-container">
      <div className="message-history">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isUser ? 'user' : 'bot'}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
        <div className="mic-container">
            {characterStateIcon[characterState]}
            <Box component="div" className={`bar-container ${characterState !== CharacterState.Listening ? 'hidden' : ''}`}>
                <Box component="div" ref={(el: HTMLDivElement | null) => (bars.current[0] = el)} className="bar" />
                <Box component="div" ref={(el: HTMLDivElement | null) => (bars.current[1] = el)} className="bar middle" />
                <Box component="div" ref={(el: HTMLDivElement | null) => (bars.current[2] = el)} className="bar" />
            </Box>
        </div>
      </div>
    </div>
  );
};

export default Chat;
