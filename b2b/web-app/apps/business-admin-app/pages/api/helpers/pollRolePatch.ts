/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import patchRole from '../settings/role/patchRole';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Helper function to wait for a specified number of milliseconds
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Add user to the admin role.
 */
export default async function pollforRolePatching(
  accessToken: string,
  roleId: string,
  userId: string,
  maxRetryTime = 10000,
  retryInterval = 1000
): Promise<{ success: boolean; data: any; status: number }> {
  const startTime = Date.now();
  let attemptCount = 0;

  const patchRoleReq = {
    method: "POST",
    body: JSON.stringify({
      accessToken,
      userId
    }),
    query: { roleId },
  } as unknown as NextApiRequest;

  const patchRoleRes = {
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      this.data = data;
      return this;
    },
  } as unknown as NextApiResponse;

  while (Date.now() - startTime < maxRetryTime) {
    attemptCount++;
    
    try {
      await patchRole(patchRoleReq, patchRoleRes);
      
      if (patchRoleRes.statusCode === 200 || patchRoleRes.statusCode === 201) {
        return { 
          success: true, 
          data: patchRoleRes.data, 
          status: patchRoleRes.statusCode 
        };
      }

      if (patchRoleRes.statusCode === 400) {
        await delay(retryInterval);
        continue;
      }

      return { 
        success: false, 
        data: patchRoleRes.data, 
        status: patchRoleRes.statusCode 
      };
    } catch (err) {
      console.error(`Exception on attempt ${attemptCount}:`, err);
      await delay(retryInterval);
    }
  }

  return { 
    success: false, 
    data: { error: "Role adding timed out" }, 
    status: 408 
  };
}
