# Navigating IAM in the Modern Enterprise

## Overview

Managing identity and access is a critical cornerstone for enterprise security, agility and user experience today. It is critically important for  all users that include employees of an enterprise (B2E), consumers (B2C), as well as business customers, partners, or franchises (B2B).

The technical deep dive of this tutorial mainly focuses on managing secure and frictionless access for consumer facing applications (web and mobile), and B2B customer facing SaaS applications.

The tutorial illustrates B2C and B2B related access management requirements around a hypothetical veterinary service provider, "PetCare. PetCare offers a web and mobile application for pet owners to manage their pet details and vaccination status (B2C). Additionally, it provides a SaaS application for veterinary businesses to register and manage doctor appointments and medical records of pets treated (B2B).

In this tutorial, we will explore the following with a suite of applications that integrate with Asgardeo and WSO2 Identity Server under the outlined scenario above.

**CIAM for consumer facing applications**
1. Integrating a SPA with Asgardeo and managing access for that application.
 - Self registration
 - Account linking
 - Self service account management
 - Single Logout (SLO)
 - Multi-Factor Authentication (MFA)
 - Passwordless Authentication
 - Access a high assurance API
 - Integrate with Salesforce

2. Providing a native access experience for a mobile application still adhering to best security practices using the In-App Authentication API
   
   <img width="800" alt="Screenshot 2024-05-03 at 3 59 01 PM" src="https://github.com/wso2con2024/iam-tutorial/assets/4951983/f65cab54-f319-4356-a66f-2d21ab0ae08d">

**CIAM for B2B Customer facing applications**

Integrating a B2B Saas app with WSO2 Identity Server and serving self serviced access management and administration for B2B customers.
- Authorizing APIs
- Managing organizations
- Delegating administrative access for customer organization admins
- Configuring login and access policies per customer organization
- Support for customers’ branding
- Let customers to selectively subscribe to apps
- Modelling reseller/partner usecases with organization hierarchies

## Prerequisites
The following prerequisites are needed to try out the tutorial samples

1. Access for WSO2 IAM products:
   - Account in [Asgardeo](https://wso2.com/asgardeo/)
   - Latest [WSO2 Identity Server 7.0](https://wso2.com/identity-server/) distribution up and running

2. Have following to run sample applications that integrates with IAM: 
   - Account in [GitHub](https://github.com/) to fork and download tutorial samples
   - [npm](https://www.npmjs.com/)
   - [Ballerina](https://ballerina.io/downloads/)

3. Have following to perform integrations with IAM: 
   - Account in Google and access for [Google Developer Console](https://console.cloud.google.com/apis/dashboard)
   - Account for [Salesforce Developer Edition](https://developer.salesforce.com/signup) 
   - Account in [Choreo](https://choreo.dev/) (If you have an account is Asgardeo you can use the same to access Choreo)

4. Development tools:
   - [Postman](https://www.postman.com/downloads/) or you can also use curl to invoke APIs
   - [Visual Studio Code](https://code.visualstudio.com/)
