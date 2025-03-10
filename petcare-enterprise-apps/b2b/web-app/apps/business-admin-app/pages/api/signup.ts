import type { NextApiRequest, NextApiResponse } from "next";
import { notPostError } from "@pet-management-webapp/shared/data-access/data-access-common-api-util";
import getToken from "./clientCredentials";
import validateOrgName from "./createTeam/checkName";
import createOrg from "./createTeam/addTeam";
import addUser from "./settings/user/addUser";
import listCurrentApplication from "./settings/application/listCurrentApplication";
import getRole from "./settings/role/getRole";
import patchRole from "./settings/role/patchRole";
import switchOrg from "./settings/switchOrg";
import { getConfig } from "@pet-management-webapp/business-admin-app/util/util-application-config-util";

/**
 * Signup handler to onboard user and team.
 *
 * @param req - request containing user and team details
 * @param res - response
 *
 * @returns success or error response
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return notPostError(res);
  }

  const { firstName, lastName, email, password, organizationName, appName } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !organizationName
  ) {
    return res.status(400).json({
      error:
        "All fields are required: Email, Password, First Name, Last Name and Team Name",
    });
  }

  try {
    // Step 1: Get access token
    const tokenData = await getToken();
    let accessToken = tokenData.access_token;

    // Step 2: Validate organization name
    const mockReq = {
      method: "POST",
      body: JSON.stringify({ name: organizationName, accessToken }),
    } as unknown as NextApiRequest;

    const mockRes = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
    } as unknown as NextApiResponse;

    await validateOrgName(mockReq, mockRes);

    if (mockRes.statusCode !== 200) {
      return res.status(400).json({
        error: "Organization name validation failed",
        details: mockRes.data,
      });
    }

    // Step 3: Create organization
    const createOrgReq = {
      method: "POST",
      body: JSON.stringify({ name: organizationName, accessToken }),
    } as unknown as NextApiRequest;

    const createOrgRes = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
    } as unknown as NextApiResponse;

    await createOrg(createOrgReq, createOrgRes);

    if (createOrgRes.statusCode !== 201) {
      return res.status(createOrgRes.statusCode).json(createOrgRes.data);
    }

    const orgData = createOrgRes.data;
    const orgId = orgData.id;

    // Step 4: Switch to the newly created organization to get a token for that org.
    const switchOrgReq = {
      method: "POST",
      body: JSON.stringify({ subOrgId: orgId, param: accessToken }),
    } as unknown as NextApiRequest;

    const switchOrgRes = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
    } as unknown as NextApiResponse;

    await switchOrg(switchOrgReq, switchOrgRes);

    if (switchOrgRes.statusCode !== 200) {
      return res.status(switchOrgRes.statusCode).json({
        error: "Failed to switch to the new organization",
        details: switchOrgRes.data,
      });
    }

    accessToken = switchOrgRes.data.access_token;

    // Step 5: Create user using the existing addUser function
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
    } as unknown as NextApiRequest;

    const addUserRes = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
    } as unknown as NextApiResponse;

    await addUser(addUserReq, addUserRes);

    if (addUserRes.statusCode !== 200) {
      return res.status(addUserRes.statusCode).json(addUserRes.data);
    }

    const userData = addUserRes.data;
    const userId = userData.id;

    // Step 6: Get application ID
    const appReq = {
      method: "POST",
      body: JSON.stringify({ accessToken, orgId }),
      query: { appName },
    } as unknown as NextApiRequest;

    const appRes = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
    } as unknown as NextApiResponse;

    await listCurrentApplication(appReq, appRes);

    if (
      appRes.statusCode !== 200 ||
      !appRes.data.applications ||
      appRes.data.applications.length === 0
    ) {
      return res
        .status(404)
        .json({ error: `Application '${appName}' not found` });
    }

    const appId = appRes.data.applications[0].id;

    // Step 7: Get admin role ID using the app ID as the aud value.
    const adminRoleName =
      getConfig().BusinessAdminAppConfig.ManagementAPIConfig.AdminRole;

    const roleReq = {
      method: "POST",
      body: JSON.stringify({ accessToken }),
      query: {
        orgId,
        adminRoleName,
        roleAudienceValue: appId,
      },
    } as unknown as NextApiRequest;

    const roleRes = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
    } as unknown as NextApiResponse;

    await getRole(roleReq, roleRes);

    if (
      roleRes.statusCode !== 200 ||
      !roleRes.data.Resources ||
      roleRes.data.Resources.length === 0
    ) {
      return res.status(404).json({ error: "Admin role not found" });
    }

    const roleId = roleRes.data.Resources[0].id;

    // Step 8: Assign admin role to user
    const patchRoleReq = {
      method: "POST",
      body: JSON.stringify({
        accessToken,
        userId,
        param: {
          Operations: [
            { op: "add", path: "users", value: [{ value: userId }] },
          ],
        },
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

    await patchRole(patchRoleReq, patchRoleRes);

    if (patchRoleRes.statusCode !== 200) {
      return res.status(patchRoleRes.statusCode).json(patchRoleRes.data);
    }

    return res.status(201).json({
      success: true,
      organization: orgData,
      user: userData,
      roleAssignment: patchRoleRes.data,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}
