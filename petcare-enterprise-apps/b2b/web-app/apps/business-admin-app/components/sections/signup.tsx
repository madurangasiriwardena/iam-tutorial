import React, { useState } from "react";
import { Modal, Button, Loader, Message, useToaster } from "rsuite";
import { Form } from "react-final-form";
import {
  FormButtonToolbar,
  FormField
} from "@pet-management-webapp/shared/ui/ui-basic-components";
import FormSuite from "rsuite/Form";
import { getConfig } from "@pet-management-webapp/business-admin-app/util/util-application-config-util";

export const SignUp = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toaster = useToaster();

  const handleSignUp = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          organizationName: values.organizationName,
          appName:
            getConfig().BusinessAdminAppConfig.ManagementAPIConfig
              .SharedApplicationName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      toaster.push(
        <Message type="success" closable>
          Sign up successful! Your profile and organization has been created.
        </Message>
      );

      onClose();
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>
        <Modal.Title>Sign Up</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          onSubmit={handleSignUp}
          render={({ handleSubmit }) => (
            <FormSuite
              layout="vertical"
              onSubmit={() => {
                handleSubmit();
              }}
              fluid
            >
              <FormField name="email" label="Email">
                <FormSuite.Control name="email" required />
              </FormField>

              <FormField name="password" label="Password">
                <FormSuite.Control name="password" type="password" required />
              </FormField>

              <FormField name="firstName" label="First Name">
                <FormSuite.Control name="firstName" required />
              </FormField>

              <FormField name="lastName" label="Last Name">
                <FormSuite.Control name="lastName" required />
              </FormField>

              <FormField name="organizationName" label="Team Name">
                <FormSuite.Control name="organizationName" required />
              </FormField>

              <FormButtonToolbar
                submitButtonText="Submit"
                submitButtonDisabled={loading}
                onCancel={onClose}
              />
              {loading && (
                <Loader size="sm" backdrop content="Signing you up!" vertical />
              )}
              {error && <Message type="error">{error}</Message>}
            </FormSuite>
          )}
        />
      </Modal.Body>
    </Modal>
  );
};
