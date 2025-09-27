import React, {useState, KeyboardEvent, RefObject} from 'react';
import './Chat.css';
import { IconButton, Box, Tooltip } from '@mui/material';
import { KeyboardVoiceOutlined, MicOffOutlined, Pause, Send } from '@mui/icons-material';
import { CharacterState } from '../apis/speechRecognition';

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

  const getMicButtonProps = () => {
    switch (characterState) {
      case CharacterState.Idle:
        return {
          icon: <KeyboardVoiceOutlined />,
          color: 'rgba(255, 255, 255, 0.9)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          tooltip: 'Start Recording',
          disabled: false,
        };
      case CharacterState.Listening:
        return {
          icon: <Pause />,
          color: 'white',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          tooltip: 'Stop Recording',
          disabled: false,
        };
      case CharacterState.Speaking:
        return {
          icon: <MicOffOutlined />,
          color: 'rgba(255, 255, 255, 0.7)',
          background: 'rgba(0, 0, 0, 0.3)',
          tooltip: 'Character is speaking...',
          disabled: true,
        };
      default:
        return {
          icon: <KeyboardVoiceOutlined />,
          color: 'rgba(255, 255, 255, 0.9)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          tooltip: 'Start Recording',
          disabled: false,
        };
    }
  };

  const micButtonProps = getMicButtonProps();


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
          placeholder="Type your message or use voice..."
          disabled={characterState === CharacterState.Speaking}
        />
        <Tooltip title="Send Message">
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || characterState === CharacterState.Speaking}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              width: 48,
              height: 48,
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.2)',
                color: 'rgba(255, 255, 255, 0.5)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <Send />
          </IconButton>
        </Tooltip>
        <div className="mic-container">
          <Tooltip title={micButtonProps.tooltip}>
            <IconButton
              onClick={onMicButtonPressed}
              disabled={micButtonProps.disabled}
              sx={{
                background: micButtonProps.background,
                color: micButtonProps.color,
                width: 48,
                height: 48,
                '&:hover': {
                  transform: micButtonProps.disabled ? 'none' : 'translateY(-2px)',
                  filter: micButtonProps.disabled ? 'none' : 'brightness(1.1)',
                },
                '&:disabled': {
                  background: micButtonProps.background,
                  color: micButtonProps.color,
                },
                transition: 'all 0.3s ease',
              }}
            >
              {micButtonProps.icon}
            </IconButton>
          </Tooltip>
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
