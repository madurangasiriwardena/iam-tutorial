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

import { Grid } from "@mui/material";
import { getMeetings } from "../../../../APICalls/getMeetings/get-meetings";
import { Meeting } from "../../../../types/meeting";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Stack } from "rsuite";
import MeetingCard from "./meetingCard";
import MeetingOverview from "./meetingOverview";
import styles from "../../../../styles/meeting.module.css";
import ScheduleMeetingComponent from "./scheduleMeetingComponent";

interface ManageMeetingsSectionProps {
    session: Session
}

/**
 *
 * @returns The idp interface section.
 * @param props
 */
export default function ManageMeetingsSection(props: ManageMeetingsSectionProps) {

    const { session } = props;
    const [ meetingList, setMeetingList ] = useState<Meeting[] | null>(null);
    const [ isScheduleMeetingOpen, setIsScheduleMeetingOpen ] = useState(false);
    const [ isMeetingOverviewOpen, setIsMeetingOverviewOpen ] = useState(false);
    const [ meeting, setMeeting ] = useState<Meeting | null>(null);
    const [ isMeetingEditOpen, setIsMeetingEditOpen ] = useState(false);
    const router = useRouter();

    async function getDoctorList() {
        const accessToken = session.accessToken;

        getMeetings(accessToken)
            .then((res) => {
                if (res.data instanceof Array) {
                    setMeetingList(res.data);
                }
            })
            .catch((e) => {
                // eslint-disable-next-line no-console
                console.log(e);
            });
    }

    useEffect(() => {
        getDoctorList();
    }, [ session, isScheduleMeetingOpen, isMeetingEditOpen ]);

    useEffect(() => {
        router.replace(router.asPath);
    }, [ isMeetingEditOpen ]);

    const onScheduleMeetingClick = (): void => {
        setIsScheduleMeetingOpen(true);
    };

    const closeAddMeetingDialog = (): void => {
        setIsScheduleMeetingOpen(false);
    };

    const closeDoctorOverviewDialog = (): void => {
        setIsMeetingOverviewOpen(false);
    };

    return (
        <div className={ styles.tableMainPanelDivDoc }>
            <Stack direction="row" justifyContent="space-between">
                <Stack direction="column" alignItems="flex-start">
                    <h2>{ "Manage Meetings" }</h2>
                    <p>{ "Manage meetings in the organization" }</p>
                </Stack>
                <Button className={ styles.buttonCircular } onClick={ onScheduleMeetingClick }>
                    Schedule a meeting
                </Button>
            </Stack>

            <ScheduleMeetingComponent
                session={ session }
                open={ isScheduleMeetingOpen }
                onClose={ closeAddMeetingDialog }
            />

            <div>
                { meetingList && (
                    <div className={ styles.meetingList }>
                        { meetingList.map((meeting) => (
                            <div key={ meeting.id } onClick={ () => { setMeeting(meeting); } }>
                                <MeetingCard session={session} meeting={meeting} isMeetingEditOpen={isMeetingEditOpen}
                                             onView={function (meetingId: string): void {
                                                 setIsMeetingOverviewOpen(true)
                                             }} onStart={function (meetingId: string): void {

                                             }} onEdit={function (meetingId: string): void {
                                    setIsMeetingEditOpen(true)
                                }} onDelete={function (meetingId: string): void {
                                    throw new Error("Function not implemented.");
                                }} />
                            </div>
                        )) }
                    </div>
                )}
            </div>
            <div>
                <MeetingOverview
                    session={ session }
                    isOpen={ isMeetingOverviewOpen }
                    setIsOpen={ setIsMeetingOverviewOpen }
                    meeting={ meeting }
                    isMeetingEditOpen={ isMeetingEditOpen }
                    setIsMeetingEditOpen={ setIsMeetingEditOpen }
                    onClose={ closeDoctorOverviewDialog }
                />
            </div>
        </div>
    );
}
