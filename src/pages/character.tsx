/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { SettingsOutlined, PlayArrow } from '@mui/icons-material';
import { AppBar, Box, Button, CardMedia, IconButton, Toolbar, Typography, Fade, CircularProgress } from '@mui/material';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAvatarImage from '../apis/avatarImage';
import useLanguageModel, { MessageProps } from '../apis/languageModel';
import useSpeechRecognition, { CharacterState } from '../apis/speechRecognition';
import useTextToSpeech from '../apis/textToSpeech';
import useStyle from './styles';
import { Canvas } from '@react-three/fiber'
import * as talkingHead from '../apis/talkingHead';
import {Doggo} from '../components/ThreeJS/Doggo07';
import {ZEPETO_TORSO_3} from '../components/ThreeJS/ZEPETO_TORSO_3';
import Chat, { Message } from '../components/Chat';

const useZepetoModel = false;

const Character: React.FC = () => {
  const navigate = useNavigate();
  const { sendMessage } = useLanguageModel();
  const {
    characterState,
    bars,
    setCharacterState,
    onMicButtonPressed,
    setOnSpeechFoundCallback,
    initMic,
  } = useSpeechRecognition();
  const { convert, setOnProcessCallback, initTts } = useTextToSpeech();
  const { storedImage } = useAvatarImage();
  const {boxWidth} = useStyle();
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  const handleSendMessage = useCallback(async (message: string) => {
    if (characterState === CharacterState.Speaking) return;
    
    setIsLoading(true);
    const userMessage: Message = { text: message, isUser: true };
    const newMessages = [...messagesRef.current, userMessage];
    setMessages(newMessages);

    const apiHistory: MessageProps[] = newMessages.map(msg => ({
      author: msg.isUser ? '0' : '1',
      content: msg.text,
    }));

    try {
      const botResponse = await sendMessage(apiHistory);
      const botMessage: Message = { text: botResponse, isUser: false };
      setMessages(prevMessages => [...prevMessages, botMessage]);

      setCharacterState(CharacterState.Speaking);
      await convert(botResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { 
        text: 'Sorry, I encountered an error. Please try again.', 
        isUser: false 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setCharacterState(CharacterState.Idle);
    }
  }, [sendMessage, convert, setCharacterState, characterState]);

  useEffect(() => {
    if (isStarted) {
      talkingHead.runBlendshapesDemo(useZepetoModel);
      setOnProcessCallback((audioData: Float32Array) => {
        talkingHead.registerCallback(audioData);
      });
      setOnSpeechFoundCallback((transcription: string) => {
        handleSendMessage(transcription);
      });
    }
  }, [isStarted, setOnProcessCallback, setOnSpeechFoundCallback, handleSendMessage]);

  const handleCustomizeButtonClick = () => {
    if (characterState === CharacterState.Idle) {
      navigate('/personality');
    }
  };

  const handleStartClick = async () => {
    setIsLoading(true);
    await initMic();
    initTts();
    setIsLoading(false);
    setIsStarted(true);
  };

  if (!isStarted) {
    return (
      <Box
        component="div"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          padding: 4,
        }}
      >
        <Fade in timeout={1000}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ 
              fontWeight: 700, 
              mb: 2,
              background: 'linear-gradient(45deg, #fff, #f0f0f0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Talking Character
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
              Meet your AI companion powered by advanced language models
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleStartClick}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50px',
                padding: '12px 32px',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isLoading ? 'Initializing...' : 'Start Experience'}
            </Button>
          </Box>
        </Fade>
      </Box>
    );
  }

  return (
    <Box
      component="div"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        paddingLeft: '5vh',
        paddingRight: '5vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{width: boxWidth, alignSelf: 'center'}}>
        <Toolbar className="tool-bar">
          <Box
            component="div"
            sx={{ 
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '50%',
              width: '6vh',
              height: '6vh',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}>
            <IconButton
              onClick={handleCustomizeButtonClick}
              disabled={characterState !== CharacterState.Idle}
              aria-label="settings"
              sx={{
                '&:hover': {
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}>
              <SettingsOutlined
                sx={{
                  fontSize: '3vh', 
                  color: characterState === CharacterState.Idle ? '#667eea' : '#ccc'
                }}
              />
            </IconButton>
          </Box>
          {isLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <CircularProgress size={20} sx={{ color: '#667eea' }} />
              <Typography sx={{ ml: 1, color: '#667eea', fontSize: '2vh' }}>
                Processing...
              </Typography>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box
        component="div"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          flexDirection: 'column',
          position: 'relative',
        }}>
        <Box
          component="div"
          sx={{
            width: boxWidth,
            height: '40vh',
            boxSizing: 'border-box',
            overflow: 'hidden',
            margin: '0 0 2vh 0',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
          {storedImage === '' || storedImage === null ? (
            useZepetoModel ?
            <Canvas
              camera={{ fov:45, rotation: [0,0,0], position: [0, 0, 15] }}
            >
              <pointLight position={[0, 0, 10]} intensity={.03}/>
              <ambientLight intensity={1.} />
              <ZEPETO_TORSO_3></ZEPETO_TORSO_3>
            </Canvas>
            :
            <Canvas
              camera={{ fov:45, rotation: [0,0,0], position: [0, 0, 10] }}
              style={{ 
                background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
                borderRadius: '24px',
              }}
            >
              <pointLight position={[0, 0, 10]} intensity={.03}/>
              <Doggo></Doggo>
            </Canvas>
          ) : (
            <CardMedia
              id="talkingHeadIframe"
              component="img"
              image={storedImage}
              alt="Uploaded Image"
              sx={{
                borderRadius: '24px',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )}
        </Box>

        <Box
          component="div"
          sx={{
            width: boxWidth,
            height: '30vh', 
            marginBottom: '2vh'
          }}>
          <Chat 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            characterState={characterState} 
            onMicButtonPressed={onMicButtonPressed} 
            bars={bars} 
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Character;
