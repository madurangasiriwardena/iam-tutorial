import ballerinax/java.jdbc;
import ballerina/sql;
import ballerina/log;

function dbGetMeetingsByOrg(string org) returns Meeting[]|error {

    jdbc:Client|error dbClient = getConnection();
    if dbClient is error {
        return handleError(dbClient);
    }

    do {
        sql:ParameterizedQuery query = `SELECT d.id, d.org, d.createdAt, d.topic, d.date, d.startTime, d.duration, 
        d.timeZone FROM Meeting WHERE org = ${org}`;
        stream<Meeting, sql:Error?> meetingStream = dbClient->query(query);

        map<Meeting> meetingList = check getMeetingsFromStream(meetingStream);
        check meetingStream.close();
        return meetingList.toArray();
    }
    on fail error e {
        return handleError(e);
    }
}

function dbGetMeetingByIdAndOrg(string org, string meetingId) returns Meeting|()|error {

    jdbc:Client|error dbClient = getConnection();
    if dbClient is error {
        return handleError(dbClient);
    }

    do {
        sql:ParameterizedQuery query = `SELECT d.id, d.org, d.createdAt, d.topic, d.date, d.startTime, d.duration, 
        d.timeZone FROM Meeting WHERE org = ${org} and id = ${meetingId}`;
        stream<Meeting, sql:Error?> meetingStream = dbClient->query(query);

        map<Meeting> meetingList = check getMeetingsFromStream(meetingStream);

        if meetingList.length() == 0 {
            return ();
        }
        return meetingList.get(meetingId);
    }
    on fail error e {
        return handleError(e);
    }
}

function dbGetMeetingByMeetingId(string meetingId) returns Meeting|()|error {

    jdbc:Client|error dbClient = getConnection();
    if dbClient is error {
        return handleError(dbClient);
    }

    do {
        sql:ParameterizedQuery query = `SELECT d.id, d.org, d.createdAt, d.topic, d.date, d.startTime, d.duration, 
        d.timeZone FROM Meeting WHERE id = ${meetingId}`;
        stream<Meeting, sql:Error?> meetingStream = dbClient->query(query);

        map<Meeting> meetingList = check getMeetingsFromStream(meetingStream);

        if meetingList.length() == 0 {
            return ();
        }
        return meetingList.get(meetingId);
    }
    on fail error e {
        return handleError(e);
    }
}

function dbDeleteMeetingById(string org, string meetingId) returns string|()|error {

    jdbc:Client|error dbClient = getConnection();
    if dbClient is error {
        return handleError(dbClient);
    }

    sql:ParameterizedQuery query = `DELETE from Meeting WHERE id = ${meetingId} and org = ${org}`;
    sql:ExecutionResult|sql:Error result = dbClient->execute(query);

    if result is sql:Error {
        return handleError(result);
    } else if result.affectedRowCount == 0 {
        return ();
    }

    return "Meeting deleted successfully";
}

function dbAddMeeting(Meeting meeting) returns Meeting|error {

    log:printInfo("Adding meeting from DB");
    jdbc:Client|error dbClient = getConnection();
    if dbClient is error {
        log:printInfo("DB client error");
        return handleError(dbClient);
    }

    transaction {
        log:printInfo("Starting transaction");
        sql:ParameterizedQuery query = `INSERT INTO Meeting (id, org, createdAt, topic, date, startTime, 
        duration, timeZone) VALUES (${meeting.id}, ${meeting.org}, ${meeting.createdAt}, 
        ${meeting.topic}, ${meeting.date}, ${meeting.startTime}, ${meeting.duration}, ${meeting.timeZone});`;

        log:printInfo("executing query");

        sql:ExecutionResult|sql:Error insertResult = check dbClient->execute(query);
        check commit;

        if insertResult is sql:Error {
            log:printError("Error while inserting the meeting", insertResult);
        }

        log:printInfo("Meeting added");
        Meeting|()|error addedMeeting = dbGetMeetingByMeetingId(meeting.id);
        log:printInfo("added meeting: " + meeting.toString());
        if addedMeeting is () {
            return error("Error while adding the meeting");
        }

        return addedMeeting;
    } on fail error e {
        log:printInfo("On fail error", e);
        return handleError(e);
    }
}

function dbUpdateMeeting(Meeting meeting) returns Meeting|error {

    jdbc:Client|error dbClient = getConnection();
    if dbClient is error {
        return handleError(dbClient);
    }

    transaction {
        sql:ParameterizedQuery query = `UPDATE Meeting SET topic = ${meeting.topic}, 
        createdAt = ${meeting.createdAt}, date = ${meeting.date},startTime = ${meeting.startTime},
        duration = ${meeting.duration}, timeZone = ${meeting.timeZone} WHERE id = ${meeting.id};`;
        _ = check dbClient->execute(query);

        check commit;

        Meeting|()|error updatedMeeting = dbGetMeetingByMeetingId(meeting.id);
        if updatedMeeting is () {
            return error("Error while updating the meeting");
        }
        return updatedMeeting;

    } on fail error e {
        return handleError(e);
    }
}

function handleError(error err) returns error {
    log:printError("Error while processing the request", err);
    return error("Error while processing the request");
}

function getMeetingsFromStream(stream<Meeting, sql:Error?> meetingStream) returns map<Meeting>|error {

    map<Meeting> meetings = {};

    check from Meeting entry in meetingStream
        do {
            Meeting meeting = {
                id: entry.id,
                topic: entry.topic,
                createdAt: entry.createdAt,
                date: entry.date,
                duration: entry.duration,
                startTime: entry.startTime,
                timeZone: entry.timeZone,
                org: entry.org
            };

            meetings[meeting.id] = meeting;
        };

    return meetings;
}
