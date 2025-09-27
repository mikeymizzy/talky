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

import {Buffer} from 'buffer';
import {useContext, useRef} from 'react';

import {ConfigContext} from '../context/config';
import {post} from './network';
import {Voice} from './voices';

interface ProcessCallback {
  (audioData: Float32Array): void;
}

async function synthesize(text: string, voice: Voice) {
  if (!text) return null;
  const response = await post(
      'https://texttospeech.googleapis.com/v1/text:synthesize', {
        input: {text},
        voice: {
          languageCode: voice.languageCodes[0],
          name: voice.name,
        },
        audioConfig: {audioEncoding: 'LINEAR16', sampleRateHertz: 24000}
      });
  if (response.audioContent) {
    return Buffer.from(response.audioContent, 'base64');
  }
  return null;
}

const useTextToSpeech = () => {
  const audioContext = useRef<AudioContext>(new AudioContext());
  const onProcessCallback = useRef<ProcessCallback>(() => {});
  const {config} = useContext(ConfigContext);

  const setOnProcessCallback = (callback: ProcessCallback) => {
    onProcessCallback.current = callback;
  };

  const initTts = () => {
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
  };

  const convert = async (text: string) => {
    const audioData = await synthesize(text, config.voice);
    if (audioData) {
      const audioBuffer = await audioContext.current.decodeAudioData(
          audioData.buffer.slice(
              audioData.byteOffset,
              audioData.byteOffset + audioData.byteLength));

      const source = audioContext.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.current.destination);
      source.start();

      onProcessCallback.current(audioBuffer.getChannelData(0));
    }
  };

  return {convert, setOnProcessCallback, initTts};
};

export default useTextToSpeech;
