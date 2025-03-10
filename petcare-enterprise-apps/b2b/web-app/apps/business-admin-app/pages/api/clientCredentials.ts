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

import { getConfig } from "@pet-management-webapp/business-admin-app/util/util-application-config-util";

export default async function handler() {
    const tokenResponse = await fetch(
      `${getConfig().CommonConfig.AuthorizationConfig.BaseOrganizationUrl}/oauth2/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
          scope: getConfig().BusinessAdminAppConfig.ApplicationConfig.APIScopes.join(" "),
        }).toString(),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(
        errorData?.error || `HTTP error! status: ${tokenResponse?.status}`
      );
    }

    return await tokenResponse.json();
  }
