# Run PetDesk B2C Application locally

## Prerequisites:
1. Install Ballerina 2201.5.0 https://dist.ballerina.io/downloads/2201.5.0/ballerina-2201.5.0-swan-lake-macos-arm-x64.pkg
2. Install Node 16 LTS (Tested in v16.13.0).
3. Configure choreo webhook for [Asgardeo user registration event](https://wso2.com/asgardeo/docs/guides/asgardeo-events/#implement-business-use-cases-for-asgardeo-events). Use [asgardeo_registration_webhook](/petcare-enterprise-apps/b2c/webhooks/asgardeo_registration_webhook/).

When deploying the webhook through choreo, provide the salesforce related configuration by getting them using this [guide](#setup-salesforce-account-guide).


## Create an Application in WSO2 Identity Server
1. Create a Single-Page Application named `Pet Desk App` in root organization.
2. Add the `Authorized redirect URLs` as `http://localhost:3000`.
3. Go to the `Protocol` tab and copy the `Client ID`.
4. Select `Access token` type as `JWT`.
5. Scroll down to the **Allowed grant types** and tick **Refresh Token** and **Code**.
6. Tick **Public client** on the next section.
7. Keep the rest of the default configurations and click **Update**.
8. Create `acr` claim from `User Attributes & Stores/Attributes section.
9. Create a scope called `acr` and map it to the previously created `acr` claim.
10. Go to the **User Attributes** tab.
11. Tick on the `acr`.
12. Tick on the **Email** section.
13. Expand the **Profile** section.
14. Add a tick on the Requested Column for the **Full Name** and click **Update**.
15. Then go to the **Sign-In Method** tab.
16. Configure **Google login** as described in https://wso2.com/asgardeo/docs/guides/authentication/social-login/add-google-login/
17. As shown in the below, add **Username & Password** as an **Authentication** step.
18. To perform the acr-based step up authentication add the following conditional script to the login flow.

```
// Define conditional authentication by passing one or many Authentication Context Class References 
// as comma separated values.

// Specify the ordered list of ACR here.
var supportedAcrValues = ['acr1', 'acr2'];

var onLoginRequest = function (context) {
    var selectedAcr = selectAcrFrom(context, supportedAcrValues);
    Log.info('--------------- ACR selected: ' + selectedAcr);
    context.selectedAcr = selectedAcr;
    switch (selectedAcr) {
        case supportedAcrValues[0]:
            executeStep(1, {
                onSuccess: function (context) {
                    var user = context.steps[1].subject;
                    user.claims["http://wso2.org/claims/acr"] = "acr1"
                }
            });
            break;
        case supportedAcrValues[1]:
            executeStep(1);
            executeStep(2, {
                onSuccess: function (context) {
                    var user = context.steps[1].subject;
                    user.claims["http://wso2.org/claims/acr"] = "acr2"
                }
            });
            break;
        default:
            executeStep(1, {
                onSuccess: function (context) {
                    var user = context.steps[1].subject;
                    user.claims["http://wso2.org/claims/acr"] = "acr1"
                }
            });
    }
};
```

## Run the Front End Application
1. Navigate to <PROJECT_HOME>/petcare-enterprise-apps/b2c/web-app/public and update the configuration file 
   `config.js` with the registered app details.
   
```
window.config = {
    baseUrl: "https://api.asgardeo.io/t/<your-org-name>",
    clientID: "<asgardeo-client-id>",
    signInRedirectURL: "<web-app-url>",
    signOutRedirectURL: "<web-app-url>",
    petManagementServiceURL: "<pet-management-service-url>",
    billingServerURL: "<billing-service-url>",
    salesforceServerURL: "<sales-force-service-url>",
    scope: ["openid", "email", "profile"]
    myAccountAppURL: "<my-account-url>",
    enableOIDCSessionManagement: true
};
```

2. Run the application by executing the following command in the terminal.
    ```
    npm install
    npm start
    ```
3. Visit the sample application at http://localhost:3000. 

## Run API Services
1. Navigate to <PROJECT_HOME>/petcare-enterprise-apps/b2c/apis/ballerina/pet-management-service and start the 
   pet management service by executing the following command in the terminal.
    ```
    bal run
    ```
2. Navigate to <PROJECT_HOME>/petcare-enterprise-apps/b2c/apis/ballerina/billing-management-service and start the 
   pet management service by executing the following command in the terminal.
    ```
    bal run
    ```
3. Navigate to <PROJECT_HOME>/petcare-enterprise-apps/b2c/apis/ballerina/salesforce-integration-service and provide following configurations.

```config
// Create Salesforce client configuration by reading from environment.
configurable string clientId = "";
configurable string clientSecret = "";
configurable string refreshToken = "";
configurable string refreshUrl = "";
configurable string baseUrl = "";
```

# Setup Salesforce Account Guide

1. Create a Salesforce account with the REST capability.

2. Go to Setup --> Apps --> App Manager

![!\[alt text\](image.png)](https://raw.githubusercontent.com/ballerina-platform/module-ballerinax-sfdc/master/docs/setup/resources/side-panel.png)

Setup Side Panel
Create a New Connected App.
![alt text](https://raw.githubusercontent.com/ballerina-platform/module-ballerinax-sfdc/master/docs/setup/resources/create-connected-apps.png)

3. Create Connected Apps

- Here we will be using https://test.salesforce.com as we are using sandbox enviorenment. Users can use https://login.salesforce.com for normal usage.
![alt text](https://raw.githubusercontent.com/ballerina-platform/module-ballerinax-sfdc/master/docs/setup/resources/create_connected%20_app.png)
Create Connected Apps

4. After the creation user can get consumer key and secret through clicking on the Manage Consume Details button.
![alt text](https://raw.githubusercontent.com/ballerina-platform/module-ballerinax-sfdc/master/docs/setup/resources/crdentials.png)
Consumer Secrets

5 .Next step would be to get the token.

- Log in to salesforce in your prefered browser and enter the following url.
```url
https://<YOUR_INSTANCE>.salesforce.com/services/oauth2/authorize?response_type=code&client_id=<CONSUMER_KEY>&redirect_uri=<REDIRECT_URL>
```
- Allow access if an alert pops up and the browser will be redirected to a Url like follows.

```url
https://login.salesforce.com/?code=<ENCODED_CODE>
```
- The code can be obtained after decoding the encoded code

6. Get Access and Refresh tokens

- Following request can be sent to obtain the tokens.

```curl
curl -X POST https://<YOUR_INSTANCE>.salesforce.com/services/oauth2/token?code=<CODE>&grant_type=authorization_code&client_id=<CONSUMER_KEY>&client_secret=<CONSUMER_SECRET>&redirect_uri=https://test.salesforce.com/
```
- Tokens can be obtained from the response.

Then start the 
   salesforce integration service by executing the following command in the terminal.
    ```
    bal run
    ```
    
    
> [!NOTE]
> By default, the service stores the data in memory. It can be connected to a MySQL database. Create a `Config.toml` file in the root folder of the service component and add the relevant DB configurations to the `Config.toml` files. Create MySQL database tables using the schemas located in `<PROJECT_HOME>/petcare-enterprise-apps/b2c/dbscripts directory`.

```
dbHost = "<DB_HOST>" 
dbUsername = "<DB_USERNAME>" 
dbPassword = "<DB_USER_PASSWORD>" 
dbDatabase = "<DB_NAME>" 
dbPort = "<DB_PORT>"
```
