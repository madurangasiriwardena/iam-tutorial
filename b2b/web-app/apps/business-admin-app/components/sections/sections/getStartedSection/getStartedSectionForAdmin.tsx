/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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

import React from "react";
import { Container, Typography, Button, Grid, Paper } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Session } from "next-auth";

interface GetStartedSectionComponentForAdminProps {
    session: Session;
}

const GetStartedSectionComponentForAdmin: React.FC<GetStartedSectionComponentForAdminProps> = ({ session }) => {
    return (
        <Container maxWidth="md">
            <Paper elevation={3} style={{ padding: "20px", marginTop: "20px" }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item>
                        <AccountCircleIcon style={{ width: "8vh", height: "8vh" }} />
                    </Grid>
                    <Grid item>
                        <Typography variant="h4">
                            Welcome, {session.user?.name.givenName} {session.user?.name.familyName}!
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container spacing={3} style={{ marginTop: "20px" }}>
                    <Grid item xs={12} sm={6}>
                        <Button variant="contained" color="primary" fullWidth>
                            View Meetings
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button variant="contained" color="secondary" fullWidth>
                            Manage Organization
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default GetStartedSectionComponentForAdmin;
