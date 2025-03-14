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

import { InviteConst, controllerDecodeAddUser, controllerDecodeListAllRoles, controllerDecodePatchRole } 
    from "@pet-management-webapp/business-admin-app/data-access/data-access-controller";
import { User } from "@pet-management-webapp/shared/data-access/data-access-common-models-util";
import { FormButtonToolbar, FormField, ModelHeaderComponent } 
    from "@pet-management-webapp/shared/ui/ui-basic-components";
import { errorTypeDialog, successTypeDialog } from "@pet-management-webapp/shared/ui/ui-components";
import { PatchMethod, checkIfJSONisEmpty } from "@pet-management-webapp/shared/util/util-common";
import { LOADING_DISPLAY_BLOCK, LOADING_DISPLAY_NONE, fieldValidate } 
    from "@pet-management-webapp/shared/util/util-front-end-util";
import EmailFillIcon from "@rsuite/icons/EmailFill";
import { postMeeting } from "../../../../../../APICalls/ScheduleMeeting/post-meeting";
import { Meeting, MeetingInfo } from "../../../../../../types/meeting";
import { AxiosResponse } from "axios";
import { Session } from "next-auth";
import { useCallback, useEffect, useState } from "react";
import { Form } from "react-final-form";
import { Divider, Loader, Modal, Panel, Radio, RadioGroup, SelectPicker, Stack, useToaster } from "rsuite";
import FormSuite from "rsuite/Form";
import styles from "../../../../../../styles/Settings.module.css";
import { Role } from "@pet-management-webapp/business-admin-app/data-access/data-access-common-models-util";


interface AddUserComponentProps {
    session: Session
    open: boolean
    onClose: () => void
}

/**
 * 
 * @param prop - session, open (whether modal open or close), onClose (on modal close)
 * 
 * @returns Modal to add a user.
 */
export default function AddUserComponent(props: AddUserComponentProps) {

    const { session, open, onClose } = props;

    const [ loadingDisplay, setLoadingDisplay ] = useState(LOADING_DISPLAY_NONE);
    const [ inviteSelect, serInviteSelect ] = useState<InviteConst>(InviteConst.INVITE);
    const [ userTypeSelect, setUserTypeSelect ] = useState<string>("USER");
    const [ inviteShow, setInviteShow ] = useState(LOADING_DISPLAY_BLOCK);
    const [ passwordShow, setPasswordShow ] = useState(LOADING_DISPLAY_NONE);
    const [ rolesList, setRolesList ] = useState<Role[]>([]);

    const toaster = useToaster();

    const validate = (values: Record<string, unknown>): Record<string, string> => {
        let errors: Record<string, string> = {};

        errors = fieldValidate("firstName", values.firstName, errors);
        errors = fieldValidate("familyName", values.familyName, errors);
        errors = fieldValidate("email", values.email, errors);
        if (inviteSelect === InviteConst.PWD) {
            errors = fieldValidate("password", values.password, errors);
        }

        // if (userTypeSelect === "DOCTOR") {
        //     errors = fieldValidate("DateOfBirth", values.DateOfBirth, errors);
        //     errors = fieldValidate("Gender", values.Gender, errors);
        //     errors = fieldValidate("Specialty", values.Specialty, errors);
        //     errors = fieldValidate("Address", values.Address, errors);
        // }

        return errors;
    };

    const inviteSelectOnChange = (value: InviteConst): void => {
        serInviteSelect(value);

        switch (value) {
            case InviteConst.INVITE:
                setInviteShow(LOADING_DISPLAY_BLOCK);
                setPasswordShow(LOADING_DISPLAY_NONE);

                break;

            case InviteConst.PWD:
                setInviteShow(LOADING_DISPLAY_NONE);
                setPasswordShow(LOADING_DISPLAY_BLOCK);

                break;
        }
    };

    const userTypeList: {[key: string]: string}[] = [
        {
            label: "Organization User",
            value: "USER"
        },
        {
            label: "Admin",
            value: "ADMIN"
        }
    ];

    const fetchAllRoles = useCallback(async () => {

        const res = await controllerDecodeListAllRoles(session);

        if (res) {
            setRolesList(res);
        } else {
            setRolesList([]);
        }

    }, [ session ]);

    useEffect(() => {
        fetchAllRoles();
    }, [ fetchAllRoles ]);

    const userTypeSelectOnChange = (eventKey: any): void => {
        setUserTypeSelect(eventKey);
    };

    const onUserSubmit = (response: boolean | User, form): void => {
        if (response) {
            // successTypeDialog(toaster, "Changes Saved Successfully", "User added to the organization successfully.");
            form.restart();
            onClose();
        } else {
            // errorTypeDialog(toaster, "Error Occured", "Error occured while adding the user. Try again.");
        }
    };

    const onDoctorSubmit = (response: AxiosResponse<Meeting>, form): void => {
        if (response) {
            // successTypeDialog(toaster, "Changes Saved Successfully", "Meeting add to the organization successfully.");
            form.restart();
            onClose();
        } else {
            // errorTypeDialog(toaster, "Error Occured", "Error occured while adding the doctor. Try again.");
        }
    };

    const onRoleSubmit = (response) => {
        if (response) {
            successTypeDialog(toaster, "Changes Saved Successfully", "User added to the organization successfully.");
        } else {
            errorTypeDialog(toaster, "Error Occured", "Error occured while adding the user. Try again.");
        }
    };

    const onSubmit = async (values: Record<string, string>, form): Promise<void> => {
        setLoadingDisplay(LOADING_DISPLAY_BLOCK);
        controllerDecodeAddUser(session, inviteSelect, values.firstName, values.familyName, values.email,
            values.password)
            .then((response1) => {
                onUserSubmit(response1, form);
                let roleDetails: Role;

                if (userTypeSelect === "ADMIN") {
                    // TODO change the role names
                    roleDetails = rolesList.find((role) => role.displayName === "teamspace-admin");
                    controllerDecodePatchRole(session, roleDetails.id, PatchMethod.ADD, "users", response1.id)
                        .then((response) => onRoleSubmit(response))
                        .finally(() => setLoadingDisplay(LOADING_DISPLAY_NONE));
                }

                if (userTypeSelect === "USER") {
                    roleDetails = rolesList.find((role) => role.displayName === "teamspace-user");

                    controllerDecodePatchRole(session, roleDetails.id, PatchMethod.ADD, "users", response1.id)
                        .then((response) => onRoleSubmit(response))
                        .finally(() => setLoadingDisplay(LOADING_DISPLAY_NONE));
                }
            })
            .finally(() => setLoadingDisplay(LOADING_DISPLAY_NONE));

        

    };

    const options = [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" }
    ];

    return (
        <Modal backdrop="static" role="alertdialog" open={ open } onClose={ onClose } size="sm">

            {
                (<Modal.Header>
                        <ModelHeaderComponent title="Add User" subTitle="Add a New User to the Organization" />
                    </Modal.Header>)
            }

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
                                    name="userType"
                                    label="Type of User"
                                    needErrorMessage={ true }
                                >
                                    <SelectPicker
                                        data={ userTypeList }
                                        value= { userTypeSelect }
                                        searchable={ false }
                                        defaultValue={ "USER" }
                                        onSelect={ userTypeSelectOnChange }
                                        block
                                    />
                                </FormField>

                                <FormField
                                    name="firstName"
                                    label="First Name"
                                    helperText="First name of the user."
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" />
                                </FormField>

                                <FormField
                                    name="familyName"
                                    label="Family Name"
                                    helperText="Family name of the user."
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" />
                                </FormField>

                                <Divider />

                                <FormField
                                    name="email"
                                    label="Email (Username)"
                                    helperText="Email of the user."
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" type="email" />
                                </FormField>

                                <RadioGroup
                                    name="radioList"
                                    value={ inviteSelect }
                                    defaultValue={ InviteConst.INVITE }
                                    onChange={ inviteSelectOnChange }>
                                    <b>Select the method to set the user password</b>
                                    <Radio value={ InviteConst.INVITE }>
                                        Invite the user to set their own password
                                    </Radio>

                                    <div style={ inviteShow }>
                                        <EmailInvitePanel />
                                        <br />

                                    </div>

                                    <Radio value={ InviteConst.PWD }>Set a password for the user</Radio>

                                    <div style={ passwordShow }>
                                        <br />

                                        <FormField
                                            name="password"
                                            label="Password"
                                            helperText="Password of the user."
                                            needErrorMessage={ true }
                                        >
                                            <FormSuite.Control name="input" type="password" autoComplete="off" />
                                        </FormField>

                                        {/* <FormField
                                            name="repassword"
                                            label="Re enter password"
                                            helperText="Re enter the password of the user."
                                            needErrorMessage={ true }
                                        >
                                            <FormSuite.Control name="input" type="password" autoComplete="off" />
                                        </FormField> */}

                                    </div>

                                </RadioGroup>
                                <br />

                                <FormButtonToolbar
                                    submitButtonText="Submit"
                                    submitButtonDisabled={ submitting || !checkIfJSONisEmpty(errors) }
                                    onCancel={ onClose }
                                />

                            </FormSuite>
                        ) }
                    />

                </div>
            </Modal.Body>

            <div style={ loadingDisplay }>
                <Loader size="lg" backdrop content="User is adding" vertical />
            </div>
        </Modal>

    );
}

function EmailInvitePanel() {
    return (
        <Panel bordered>
            <Stack spacing={ 30 }>
                <EmailFillIcon style={ { fontSize: "3em" } } />
                An email with a confirmation link will be sent to the provided
                email address for the user to set their own password.
            </Stack>

        </Panel>
    );
}
