/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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

import { Session } from "next-auth";
import React from "react";
import { TailSpin } from "react-loader-spinner";
import styles from "../../../../styles/meeting.module.css";
import { Meeting } from "../../../../types/meeting";

interface MeetingCardProps {
    session: Session;
    meeting: Meeting;
    isMeetingEditOpen: boolean;
    onView: (meetingId: string) => void;
    onStart: (meetingId: string) => void;
    onEdit: (meetingId: string) => void;
    onDelete: (meetingId: string) => void;
}

function MeetingCard(props: MeetingCardProps) {
    const { meeting, isMeetingEditOpen, onView, onStart, onEdit, onDelete } = props;
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        setIsLoading(false);
    }, [location.pathname === "/manage_meetings", isMeetingEditOpen]);

    return (
        <div className={styles.meetingListItem}>
            {isLoading ? (
                <div className={styles.tailSpinDiv}>
                    <TailSpin color="var(--primary-color)" height={80} width={80} />
                </div>
            ) : (
                <>
                    <div className={styles.meetingDetails}>
                        <span className={styles.meetingTopic}>{meeting.topic}</span>
                        <div className={styles.meetingInfo}>
                            <span className={styles.meetingTime}>{meeting.date}</span>
                            <span className={styles.meetingTime}>{meeting.startTime}</span>
                            <span className={styles.meetingId}>{meeting.id}</span>
                        </div>
                    </div>
                    <div className={styles.meetingActions}>
                        <button onClick={() => onStart(meeting.id)}>Start</button>
                        <button onClick={() => onView(meeting.id)}>View</button>
                        <button onClick={() => onEdit(meeting.id)}>Edit</button>
                        <button onClick={() => onDelete(meeting.id)}>Delete</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default React.memo(MeetingCard);
