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

import {GOOGLE_CLOUD_API_KEY} from '../context/constants';

function appendApiKey(endpoint: string) {
  if (endpoint.includes('key=')) {
    return endpoint;
  }
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}key=${GOOGLE_CLOUD_API_KEY}`;
}

async function executeRequest(
    endpoint: string, request: unknown, method = 'POST') {
  const response = await fetch(endpoint, {
    method,
    mode: 'cors',
    cache: 'no-cache',
    body: method === 'POST' ? JSON.stringify(request) : undefined,
    headers: {'Content-Type': 'application/json'},
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(
        `Request to ${endpoint} failed with status ${response.status}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

export async function post(endpoint: string, request: unknown) {
  const endpointWithKey = appendApiKey(endpoint);
  return executeRequest(endpointWithKey, request, 'POST');
}

export async function sendRequestToGoogleCloudApi(
    // tslint:disable-next-line:no-any Need to be able to serialize anything.
    endpoint: string, request: any, apikey: string, method = 'POST') {
  const separator = endpoint.includes('?') ? '&' : '?';
  const endpointWithParam = `${endpoint}${separator}key=${apikey}`;
  return executeRequest(endpointWithParam, request, method);
}
