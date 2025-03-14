/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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

import { LogoComponent } from "@pet-management-webapp/business-admin-app/ui/ui-components";
import { IndexHomeComponent } from "@pet-management-webapp/shared/ui/ui-components";
import { NextRouter, useRouter } from "next/router";
import React, { useEffect } from "react";
import "rsuite/dist/rsuite.min.css";
import { getPersonalization } from "../APICalls/GetPersonalization/get-personalization";
import personalize from "../components/sections/sections/settingsSection/personalizationSection/personalize";
import { Personalization } from "../types/personalization";
import { SignUp } from "../components/sections/signup";
import logoImage from "../../../libs/business-admin-app/ui/ui-assets/src/lib/images/teamspace_logo.png";
import favicon from "../../../libs/business-admin-app/ui/ui-assets/src/lib/images/teamspace_favicon.png";

/**
 * 
 * @returns - First interface of the app
 */
export default function Home() { 

    const router: NextRouter = useRouter();
    const [openSignUpModal, setOpenSignUpModal] = React.useState(false);

    const [isSignUpButtonVisible, setIsSignUpButtonVisible] = React.useState(true);

    const getOrgIdFromUrl = (): string => {
        const currentUrl = window.location.href;
        const url = new URL(currentUrl);
        const searchParams = url.searchParams;
        const orgId = searchParams.get("orgId");
      
        return orgId;
    };

    const signinOnClick = (): void => {
        if (getOrgIdFromUrl()) {
            router.push("/signin?orgId=" + getOrgIdFromUrl());
        } else {
            router.push("/signin");
        }
    };

    useEffect(() => {
        if (getOrgIdFromUrl()) {
            getPersonalization(getOrgIdFromUrl())
                .then((response) => {
                    personalize(response.data);
                })
                .catch(async (err) => {
                    if (err.response?.status === 404) {
                        const defaultPersonalization: Personalization = {
                            faviconUrl: favicon.src,
                            logoAltText: "Teamspace App Logo",
                            logoUrl: logoImage.src,
                            org: "",
                            primaryColor: "#4F40EE",
                            secondaryColor: "#E0E1E2"
                        };
                        personalize(defaultPersonalization);  
                    }
                });
            setIsSignUpButtonVisible(false)
        }
    }, [ ]);

  const handleCloseSignUpModal = () => {
    setOpenSignUpModal(false)
  }

    return (
        <>
            <IndexHomeComponent 
                tagText="Sign in to continue"
                signinOnClick={ signinOnClick }
                signUpOnClick={ () => setOpenSignUpModal(true) }
                logoComponent = { <LogoComponent imageSize="medium"/> }
                isSignUpButtonVisible={ isSignUpButtonVisible }
            />
            <SignUp open={openSignUpModal} onClose={handleCloseSignUpModal} />
        </>
    );
}
