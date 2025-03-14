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

import { Grid, Typography } from "@mui/material";
import { ModelHeaderComponent } from "@pet-management-webapp/shared/ui/ui-basic-components";
import { Meeting } from "../../../../types/meeting";
import axios, { AxiosError } from "axios";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { Button, Modal } from "rsuite";
import EditMeeting from "./editMeeting";
import styles from "../../../../styles/meeting.module.css";

interface MeetingOverviewProps {
    session: Session;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    meeting: Meeting;
    isMeetingEditOpen: boolean;
    setIsMeetingEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onClose: () => void;
}

export default function MeetingOverview(props: MeetingOverviewProps) {
    const { session, isOpen, setIsOpen, meeting, isMeetingEditOpen, setIsMeetingEditOpen, onClose } = props;
    const [stringDate, setStringDate] = useState("");

    useEffect(() => {
        if (meeting && meeting.createdAt != "") {
            const isoString = meeting.createdAt;
            const date = new Date(isoString);
            const stringDate = date.toLocaleString();
            setStringDate(stringDate);
        }
    }, [isOpen]);

    const handleEdit = () => {
        setIsOpen(false);
        setIsMeetingEditOpen(true);
    };

    return (
        <>
            <Modal backdrop="static" role="alertdialog" open={isOpen} onClose={onClose} size="sm">
                <Modal.Header>
                    <ModelHeaderComponent title="Meeting Overview" />
                </Modal.Header>
                <Modal.Body>
                    <div className={styles.meetingOverviewMainDiv}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography className={styles.docEditFont}>Topic</Typography>
                                <Typography className={styles.docEditFont}>Date</Typography>
                                <Typography className={styles.docEditFont}>Start Time</Typography>
                                <Typography className={styles.docEditFont}>Duration</Typography>
                                <Typography className={styles.docEditFont}>Time Zone</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography className={styles.docOverviewFont}>{meeting?.topic}</Typography>
                                <Typography className={styles.docOverviewFont}>{meeting?.date}</Typography>
                                <Typography className={styles.docOverviewFont}>{meeting?.startTime}</Typography>
                                <Typography className={styles.docOverviewFont}>{meeting?.duration}</Typography>
                                <Typography className={styles.docOverviewFont}>{meeting?.timeZone}</Typography>
                            </Grid>
                        </Grid>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleEdit} appearance="primary">
                        Edit
                    </Button>
                    <Button onClick={onClose} appearance="subtle">
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
            <div>
                <EditMeeting session={session} isOpen={isMeetingEditOpen} setIsOpen={setIsMeetingEditOpen} meeting={meeting} />
            </div>
        </>
    );
}
