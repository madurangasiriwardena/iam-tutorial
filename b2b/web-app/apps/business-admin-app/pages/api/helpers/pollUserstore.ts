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

import { NextApiRequest, NextApiResponse } from 'next';
import getUserstores from '../userstores/getuserstores';

/**
 * Helper function to wait for a specified number of milliseconds
 * @param ms - milliseconds to wait
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Helper function to poll for the DEFAULT userstore
 * @param accessToken - access token for API calls
 * @param orgId - organization ID
 * @param maxAttempts - maximum number of polling attempts
 * @param intervalMs - interval between polling attempts in milliseconds
 * @returns true if DEFAULT userstore is found, false otherwise
 */
export default async function pollForDefaultUserstore(
    accessToken: string,
    orgId: string,
    maxAttempts = 30,
    intervalMs = 2000,
  ): Promise<boolean> {

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {

      const listUserstoresReq = {
        method: "POST",
        body: JSON.stringify({ accessToken, orgId }),
      } as unknown as NextApiRequest

      const listUserstoresRes = {
        status: function (code) {
          this.statusCode = code
          return this
        },
        json: function (data) {
          this.data = data
          return this
        },
      } as unknown as NextApiResponse

      await getUserstores(listUserstoresReq, listUserstoresRes)

      if (listUserstoresRes.statusCode === 200) {
        const userstores = listUserstoresRes.data || []
        const defaultUserstoreExists = userstores.some(
          (userstore) => userstore.name === "DEFAULT" || userstore.id === "DEFAULT",
        )

        if (defaultUserstoreExists) {
          return true
        }

        console.log(`DEFAULT userstore not found on attempt ${attempt}. Userstores:`, userstores)
      } else {
        console.log(`Failed to retrieve userstores on attempt ${attempt}. Status: ${listUserstoresRes.statusCode}`)
      }

      if (attempt < maxAttempts) {
        await delay(intervalMs)
      }
    }

    return false
  }
