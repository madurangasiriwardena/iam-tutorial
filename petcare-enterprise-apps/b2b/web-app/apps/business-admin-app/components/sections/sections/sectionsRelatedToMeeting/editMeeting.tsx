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
import { putMeeting } from "apps/business-admin-app/APICalls/UpdateMeeting/put-meeting";
import { Meeting } from "../../../../types/meeting";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { Button, Modal } from "rsuite";
import styles from "../../../../styles/meeting.module.css";

interface EditMeetingProps {
    session: Session;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    meeting: Meeting;
}

export default function EditMeeting(props: EditMeetingProps) {
    const { session, isOpen, setIsOpen, meeting } = props;
    const [topic, setTopic] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [duration, setDuration] = useState("");
    const [timeZone, setTimeZone] = useState("");

    const closeEditMeetingDialog = (): void => {
        setIsOpen(false);
    };

    useEffect(() => {
        if (meeting) {
            setTopic(meeting.topic);
            setDate(meeting.date);
            setStartTime(meeting.startTime);
            setDuration(meeting.duration);
            setTimeZone(meeting.timeZone);
        }
    }, [isOpen]);

    const handleSave = () => {
        async function updateMeeting() {
            const accessToken = session.accessToken;
            const payload: Meeting = {
                ...meeting,
                topic,
                date,
                startTime,
                duration,
                timeZone
            };

            await putMeeting(accessToken, meeting.id, payload);
        }
        updateMeeting();
        setIsOpen(false);
    };

    return (
        <Modal
            backdrop="static"
            role="alertdialog"
            open={isOpen}
            onClose={closeEditMeetingDialog}
            size="sm"
            className={styles.meetingOverviewMainDiv}>

            <Modal.Header>
                <ModelHeaderComponent title="Edit Meeting Details" />
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
                            <input
                                className={styles.docEditInputStyle}
                                id="topic"
                                type="text"
                                placeholder="Topic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                            <input
                                className={styles.docEditInputStyle}
                                id="date"
                                type="date"
                                placeholder="Date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                            <input
                                className={styles.docEditInputStyle}
                                id="startTime"
                                type="time"
                                placeholder="Start Time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                            <input
                                className={styles.docEditInputStyle}
                                id="duration"
                                type="text"
                                placeholder="Duration"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                            <input
                                className={styles.docEditInputStyle}
                                id="timeZone"
                                type="text"
                                placeholder="Time Zone"
                                value={timeZone}
                                onChange={(e) => setTimeZone(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleSave} appearance="primary">
                    Save
                </Button>
                <Button onClick={closeEditMeetingDialog} appearance="subtle">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
