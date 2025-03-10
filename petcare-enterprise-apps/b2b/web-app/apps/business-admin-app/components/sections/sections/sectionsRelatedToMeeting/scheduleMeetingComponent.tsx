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

import { FormButtonToolbar, FormField, ModelHeaderComponent } 
    from "@pet-management-webapp/shared/ui/ui-basic-components";
import { errorTypeDialog, successTypeDialog } from "@pet-management-webapp/shared/ui/ui-components";
import { checkIfJSONisEmpty } from "@pet-management-webapp/shared/util/util-common";
import { LOADING_DISPLAY_BLOCK, LOADING_DISPLAY_NONE, fieldValidate } 
    from "@pet-management-webapp/shared/util/util-front-end-util";
import { postMeeting } from "../../../../APICalls/ScheduleMeeting/post-meeting";
import { Meeting, MeetingInfo } from "../../../../types/meeting";
import { AxiosResponse } from "axios";
import { Session } from "next-auth";
import { useState } from "react";
import { Form } from "react-final-form";
import {Divider, Loader, Modal, SelectPicker, Stack, useToaster} from "rsuite";
import FormSuite from "rsuite/Form";
import styles from "../../../../styles/Settings.module.css";


interface ScheduleMeetingComponentProps {
    session: Session
    open: boolean
    onClose: () => void
}

/**
 *
 * @param props - session, open (whether modal open or close), onClose (on modal close)
 *
 * @returns Modal to add a doctor.
 */
export default function ScheduleMeetingComponent(props: ScheduleMeetingComponentProps) {

    const { session, open, onClose } = props;
    const [ loadingDisplay, setLoadingDisplay ] = useState(LOADING_DISPLAY_NONE);
    const toaster = useToaster();
    const validate = (values: Record<string, unknown>): Record<string, string> => {
        let errors: Record<string, string> = {};

        // TODO Fix the filed validation
        // errors = fieldValidate("Topic", values.Topic, errors);
        // errors = fieldValidate("Date", values.Date, errors);
        // errors = fieldValidate("StartTime", values.StartTime, errors);
        // errors = fieldValidate("Hours", values.Hours, errors);
        // errors = fieldValidate("Minutes", values.Minutes, errors);
        // errors = fieldValidate("TimeZone", values.TimeZone, errors);

        return errors;
    };


    const onDataSubmit = (response: AxiosResponse<Meeting>, form): void => {
        if (response) {
            console.log(response.status);
            successTypeDialog(toaster, "Changes Saved Successfully", "Meeting add to the organization successfully.");
            form.restart();
            onClose();
        } else {
            errorTypeDialog(toaster, "Error Occured", "Error occured while adding the doctor. Try again.");
        }
    };

    const onSubmit = async (values: Record<string, string>, form): Promise<void> => {
        setLoadingDisplay(LOADING_DISPLAY_BLOCK);
        const payload: MeetingInfo = {
            topic: values.Topic,
            date: values.Date,
            startTime: values.StartTime,
            duration: values.Hours + ":" + values.Minutes,
            timeZone: values.TimeZone,
        };

        postMeeting(session.accessToken, payload)
            .then((response) => onDataSubmit(response, form))
            .finally(() => setLoadingDisplay(LOADING_DISPLAY_NONE));
    };

    const hourOptions = [
        { value: "1", label: "1 hours" },
        { value: "2", label: "2 hours" },
        { value: "3", label: "3 hours" },
        { value: "4", label: "4 hours" }
    ];

    const minuteOptions = [
        { value: "0", label: "0 minutes" },
        { value: "15", label: "15 minutes" },
        { value: "30", label: "30 minutes" },
        { value: "45", label: "45 minutes" }
    ];

    const timeZoneOptions = [
        { value: "UTC-12:00", label: "(GMT-12:00) International Date Line West" },
        { value: "UTC-11:00", label: "(GMT-11:00) Midway Island, Samoa" },
        { value: "UTC-10:00", label: "(GMT-10:00) Hawaii" },
        { value: "UTC-09:00", label: "(GMT-09:00) Alaska" },
        { value: "UTC-08:00", label: "(GMT-08:00) Pacific Time (US & Canada)" },
        { value: "UTC-07:00", label: "(GMT-07:00) Mountain Time (US & Canada)" },
        { value: "UTC-06:00", label: "(GMT-06:00) Central Time (US & Canada)" },
        { value: "UTC-05:00", label: "(GMT-05:00) Eastern Time (US & Canada)" },
        { value: "UTC-04:00", label: "(GMT-04:00) Atlantic Time (Canada)" },
        { value: "UTC-03:00", label: "(GMT-03:00) Buenos Aires" },
        { value: "UTC-02:00", label: "(GMT-02:00) Mid-Atlantic" },
        { value: "UTC-01:00", label: "(GMT-01:00) Azores" },
        { value: "UTC+00:00", label: "(GMT+00:00) London" },
        { value: "UTC+01:00", label: "(GMT+01:00) Berlin, Madrid" },
        { value: "UTC+02:00", label: "(GMT+02:00) Athens, Cairo" },
        { value: "UTC+03:00", label: "(GMT+03:00) Moscow, Nairobi" },
        { value: "UTC+04:00", label: "(GMT+04:00) Abu Dhabi, Muscat" },
        { value: "UTC+05:00", label: "(GMT+05:00) Islamabad, Karachi" },
        { value: "UTC+05:30", label: "(GMT+05:30) Colombo" },
        { value: "UTC+06:00", label: "(GMT+06:00) Almaty, Dhaka" },
        { value: "UTC+07:00", label: "(GMT+07:00) Bangkok, Hanoi" },
        { value: "UTC+08:00", label: "(GMT+08:00) Beijing, Singapore" },
        { value: "UTC+09:00", label: "(GMT+09:00) Tokyo, Seoul" },
        { value: "UTC+10:00", label: "(GMT+10:00) Sydney, Guam" },
        { value: "UTC+11:00", label: "(GMT+11:00) Solomon Islands" },
        { value: "UTC+12:00", label: "(GMT+12:00) Auckland, Fiji" }
    ];

    return (
        <Modal backdrop="static" role="alertdialog" open={ open } onClose={ onClose } size="sm">

            <Modal.Header>
                <ModelHeaderComponent title="Schedule Meeting" subTitle="Add a New Meeting to the Organization" />
            </Modal.Header>

            <Modal.Body>
                <div className={ styles.addUserMainDiv }>

                    <Form
                        onSubmit={ onSubmit }
                        validate={ validate }
                        render={ ({ handleSubmit, form, submitting, pristine, errors }) => (
                            <FormSuite
                                layout="vertical"
                                onSubmit={ () => { handleSubmit().then(form.restart); } }
                                fluid>

                                <FormField
                                    name="Topic"
                                    label="Topic"
                                    helperText="Meeting Topic"
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" />
                                </FormField>

                                <FormField
                                    name="Date"
                                    label="Date"
                                    helperText="Date of the meeting."
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" type="date" />
                                </FormField>

                                <FormField
                                    name="StartTime"
                                    label="Start Time"
                                    helperText="Starting time of the meeting."
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" type="time" />
                                </FormField>

                                <FormField
                                    name="Duration"
                                    label="Duration"
                                    helperText="Duration of the meeting."
                                    needErrorMessage={ true }
                                >
                                    <Stack direction="row" spacing={ 10 }>
                                        <SelectPicker name="Hours" data={ hourOptions } placeholder="Hours" style={ { width: "100%" } } />
                                        <SelectPicker name="Minutes" data={ minuteOptions } placeholder="Minutes" style={ { width: "100%" } } />
                                    </Stack>
                                </FormField>

                                <FormField
                                    name="TimeZone"
                                    label="Time Zone"
                                    helperText="Select the time zone for the meeting."
                                    needErrorMessage={ true }
                                >
                                    <SelectPicker
                                        name="timeZone"
                                        data={ timeZoneOptions }
                                        placeholder="Select Time Zone"
                                        style={ { width: "100%" } }
                                    />
                                </FormField>


                                <br/>

                                <FormButtonToolbar
                                    submitButtonText="Submit"
                                    submitButtonDisabled={ submitting || pristine || !checkIfJSONisEmpty(errors) }
                                    onCancel={ onClose }
                                />

                            </FormSuite>
                        ) }
                    />

                </div>
            </Modal.Body>

            <div style={ loadingDisplay }>
                <Loader size="lg" backdrop content="Meeting is adding" vertical />
            </div>
        </Modal>

    );
}

