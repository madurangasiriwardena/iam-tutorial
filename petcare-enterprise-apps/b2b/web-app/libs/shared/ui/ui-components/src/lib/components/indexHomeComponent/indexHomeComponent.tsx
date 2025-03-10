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

import { Button } from "rsuite";
import styles from "./indexHomeComponent.module.css";
import { IndexHomeComponentProps } from "../../models/indexHomeComponent/indexHomeComponent";

/**
 * First page component
 * 
 * @param prop - tagText, signinOnClick
 */
export function IndexHomeComponent(prop: IndexHomeComponentProps) {

    const { logoComponent, signinOnClick } = prop;

    return (
        <div>
            <main className={ styles["main"] }>
                <div className={ styles["signInDiv"] }>
                    { logoComponent }
                    <div className={ styles["image"] }>
                    <Button
                        className={ styles["signInDivButton"] }
                        size="md"
                        appearance="primary"
                        onClick={ signinOnClick }>
                        Sign In
                    </Button>
                    <Button
                        className={ styles["signUpDivButton"] }
                        size="md"
                        appearance="ghost"
                        onClick={ signinOnClick }>
                        Sign Up
                    </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default IndexHomeComponent;
