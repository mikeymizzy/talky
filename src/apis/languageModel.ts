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

import {useContext} from 'react';

import {ConfigContext} from '../context/config';
import {LANGUAGE_MODEL_URL} from '../context/constants';
import {post} from './network';

export interface MessageProps {
  author: string;
  content: string;
}

const useLanguageModel = () => {
  const {config} = useContext(ConfigContext);

  const sendMessage = async (history: MessageProps[]) => {
    const response = await post(LANGUAGE_MODEL_URL, {
      systemInstruction: {
        parts: [{ text: config.backStory }],
      },
      contents: [
        ...history.map(message => ({
          role: message.author === '0' ? 'user' : 'model',
          parts: [{text: message.content}],
        })),
      ],
      generationConfig: {
        temperature: config.temperature,
        candidateCount: config.candidateCount,
        topK: config.topK,
        topP: config.topP,
      },
    });
    if (
      response &&
      response.candidates &&
      response.candidates.length > 0 &&
      response.candidates[0].content &&
      response.candidates[0].content.parts &&
      response.candidates[0].content.parts.length > 0 &&
      response.candidates[0].content.parts[0].text
    ) {
      return response.candidates[0].content.parts[0].text;
    } else {
      console.error("Unexpected response structure from language model:", response);
      return 'I am sorry, I could not generate a response.';
    }
  };

  return {sendMessage};
};

export default useLanguageModel;
