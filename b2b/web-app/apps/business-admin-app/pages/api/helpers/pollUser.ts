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

import addUser from "../settings/user/addUser";

/**
 * Helper function to wait for a specified number of milliseconds
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Polls for user creation using the existing addUser function
 */
export default async function pollForUserCreation(
  accessToken: string,
  orgId: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  maxRetryTime = 10000,
  retryInterval = 1000
): Promise<{ success: boolean; data: any; status: number }> {
  const startTime = Date.now();
  let attemptCount = 0;

  const addUserReq = {
    method: "POST",
    body: JSON.stringify({
      accessToken,
      orgId,
      param: {
        firstName,
        lastName,
        email,
        password,
      },
    }),
  };

  const addUserRes = {
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      this.data = data;
      return this;
    },
  };

  while (Date.now() - startTime < maxRetryTime) {
    attemptCount++;

    try {
      await addUser(addUserReq, addUserRes);

      if (addUserRes.statusCode === 200 || addUserRes.statusCode === 201) {
        return {
          success: true,
          data: addUserRes.data,
          status: addUserRes.statusCode,
        };
      }

      if (
        addUserRes.statusCode === 400 &&
        addUserRes.data.scimType === "Invalid user store name."
      ) {
        await delay(retryInterval);
        continue;
      }

      return {
        success: false,
        data: addUserRes.data,
        status: addUserRes.statusCode,
      };
    } catch (err) {
      console.error(`Exception on attempt ${attemptCount}:`, err);
      await delay(retryInterval);
    }
  }

  return {
    success: false,
    data: { error: "User creation timed out" },
    status: 408,
  };
}
