import ballerina/http;

UserInfoResolver userInfoResolver = new;

# A service representing a network-accessible API
# bound to port `9091`.
@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Authorization", "Content-Type"]
    }
}
service / on new http:Listener(9091) {

    # Get all meetings
    # + return - List of meetings or error
    resource function get meetings(http:Headers headers) returns Meeting[]|error? {

        UserInfo|error userInfo = userInfoResolver.retrieveUserInfo(headers);
        if userInfo is error {
            return userInfo;
        }

        return getMeetings(userInfo.organization);
    }

    # Create a new meeting
    # + newMeeting - basic meeting details
    # + return - created meeting record or error
    resource function post meetings(http:Headers headers, @http:Payload MeetingItem newMeeting) returns Meeting|error? {

        UserInfo|error userInfo = userInfoResolver.retrieveUserInfo(headers);
        if userInfo is error {
            return userInfo;
        }

        Meeting|error meeting = addMeeting(newMeeting, userInfo.organization);
        return meeting;
    }

    # Get a meeting by ID
    # + meetingId - ID of the meeting
    # + return - Meeting details or not found 
    resource function get meetings/[string meetingId](http:Headers headers) returns Meeting|http:NotFound|error? {

        UserInfo|error userInfo = userInfoResolver.retrieveUserInfo(headers);
        if userInfo is error {
            return userInfo;
        }

        Meeting|()|error result = getMeetingByIdAndOrg(userInfo.organization, meetingId);
        if result is () {
            return http:NOT_FOUND;
        }
        return result;
    }

    # Update a meeting
    # + meetingId - ID of the meeting
    # + updatedMeetingItem - updated meeting details
    # + return - Meeting details or not found 
    resource function put meetings/[string meetingId](http:Headers headers, @http:Payload MeetingItem updatedMeetingItem) returns Meeting|http:NotFound|error? {

        UserInfo|error userInfo = userInfoResolver.retrieveUserInfo(headers);
        if userInfo is error {
            return userInfo;
        }

        Meeting|()|error result = updateMeetingById(userInfo.organization, meetingId, updatedMeetingItem);
        if result is () {
            return http:NOT_FOUND;
        }
        return result;
    }

    # Delete a meeting
    # + meetingId - ID of the meeting
    # + return - Ok response or error
    resource function delete meetings/[string meetingId](http:Headers headers) returns http:NoContent|http:NotFound|error? {

        UserInfo|error userInfo = userInfoResolver.retrieveUserInfo(headers);
        if userInfo is error {
            return userInfo;
        }

        string|()|error result = deleteMeetingById(userInfo.organization, meetingId);
        if result is () {
            return http:NOT_FOUND;
        } else if result is error {
            return result;
        }
        return http:NO_CONTENT;
    }
}
