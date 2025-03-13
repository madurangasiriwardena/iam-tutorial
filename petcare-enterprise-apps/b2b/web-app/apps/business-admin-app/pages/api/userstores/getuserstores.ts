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

import type { NextApiRequest, NextApiResponse } from "next";
import { getOrgUrl } from "@pet-management-webapp/shared/util/util-application-config-util";
import {
  dataNotRecievedError,
  notPostError,
} from "@pet-management-webapp/shared/data-access/data-access-common-api-util";

/**
 * API handler to list userstores in an organization
 *
 * @param req - request
 * @param res - response
 *
 * @returns list of userstores if successful, else an error
 */
export default async function getUserstores(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return notPostError(res);
  }

  const body = JSON.parse(req.body);
  const accessToken = body.accessToken;
  const orgId = body.orgId;

  try {
    const response = await fetch(
      `${getOrgUrl(orgId)}/api/server/v1/userstores`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    return dataNotRecievedError(res);
  }
}
