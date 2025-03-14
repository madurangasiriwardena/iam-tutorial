import { getConfig } from "@pet-management-webapp/business-admin-app/util/util-application-config-util";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const body = JSON.parse(req.body);

    const name = body.name;
    const accessToken = body.accessToken

    if (!name) {
        return res.status(400).json({ error: 'Organization name is required' });
    }

    try {
        const response = await fetch(`${getConfig().CommonConfig.AuthorizationConfig.BaseOrganizationUrl}/api/server/v1/organizations/check-name`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json(errorData);
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
