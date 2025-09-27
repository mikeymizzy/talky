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

import { SettingsOutlined } from '@mui/icons-material';
import { AppBar, Box, Button, CardMedia, IconButton, Toolbar } from '@mui/material';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAvatarImage from '../apis/avatarImage';
import useLanguageModel, { MessageProps } from '../apis/languageModel';
import useSpeechRecognition, { CharacterState } from '../apis/speechRecognition';
import useTextToSpeech from '../apis/textToSpeech';
import useStyle, {COLORS} from './styles';
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
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  const handleSendMessage = useCallback(async (message: string) => {
    const userMessage: Message = { text: message, isUser: true };
    const newMessages = [...messagesRef.current, userMessage];
    setMessages(newMessages);

    const apiHistory: MessageProps[] = newMessages.map(msg => ({
      author: msg.isUser ? '0' : '1',
      content: msg.text,
    }));

    const botResponse = await sendMessage(apiHistory);
    const botMessage: Message = { text: botResponse, isUser: false };
    setMessages(prevMessages => [...prevMessages, botMessage]);

    await convert(botResponse);
    setCharacterState(CharacterState.Idle);
  }, [sendMessage, convert, setCharacterState]);

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
    await initMic();
    initTts();
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
          bgcolor: COLORS.bgcolor,
        }}
      >
        <Button variant="contained" onClick={handleStartClick}>
          Start
        </Button>
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
        bgcolor: COLORS.bgcolor,
      }}>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{width: boxWidth, alignSelf: 'center'}}>
        <Toolbar className="tool-bar">
          <Box
            component="div"
            className="shadow-back-button"
            sx={{ justifyContent: 'center', color: COLORS.bgcolor}}>
            <IconButton
              onClick={handleCustomizeButtonClick}
              aria-label="fullscreen">
              <SettingsOutlined
                sx={{fontSize: '3vh', color: COLORS.primary}}
              />
            </IconButton>
          </Box>
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
          className="shadow-box"
          sx={{
            width: boxWidth,
            height: '40vh',
            boxSizing: 'border-box',
            overflow: 'hidden',
            margin: '0 0 2vh 0',
            bgcolor: '#FFFFFF',
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
              style={{ backgroundColor: '#FAD972' }}
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
