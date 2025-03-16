import ballerinax/java.jdbc;
import ballerinax/mysql.driver as _;
import ballerina/uuid;
import ballerina/sql;
import ballerina/log;
import ballerinax/mysql;
import ballerina/time;

configurable string dbHost = "localhost";
configurable string dbUsername = "admin";
configurable string dbPassword = "admin";
configurable string dbDatabase = "CHANNEL_DB";
configurable int dbPort = 3306;
configurable string emailService = "localhost:9090";

table<Meeting> key(org, id) meetingRecords = table [];

final mysql:Client|error dbClient;
boolean useDB = false;

const BOOKING_STATUS_CONFIRMED = "Confirmed";
const BOOKING_STATUS_COMPLETED = "Completed";

function init() returns error? {

    if dbHost != "localhost" && dbHost != "" {
        useDB = true;
    }

    sql:ConnectionPool connPool = {
        maxOpenConnections: 20,
        minIdleConnections: 20,
        maxConnectionLifeTime: 300
    };

    mysql:Options mysqlOptions = {
        connectTimeout: 10
    };

    dbClient = new (dbHost, dbUsername, dbPassword, dbDatabase, dbPort, options = mysqlOptions, connectionPool = connPool);

    if dbClient is sql:Error {
        if (!useDB) {
            log:printInfo("DB configurations are not given. Hence storing the data locally");
        } else {
            log:printError("DB configuraitons are not correct. Please check the configuration", 'error = <sql:Error>dbClient);
            return error("DB configuraitons are not correct. Please check the configuration");
        }
    }

    if useDB {
        log:printInfo("DB configurations are given. Hence storing the data in DB");
    }

}

function getConnection() returns jdbc:Client|error {
    return dbClient;
}

function getMeetings(string org) returns Meeting[]|error {

    if (useDB) {
        return dbGetMeetingsByOrg(org);
    } else {
        Meeting[] meetingList = [];
        meetingRecords.forEach(function(Meeting meeting) {
            if meeting.org == org {
                meetingList.push(meeting);
            }
        });
        return meetingList;
    }
}

function updateMeetingById(string org, string meetingId, MeetingItem updatedMeetingItem) returns Meeting|()|error {

    if (useDB) {
        Meeting|() oldMeeting = check dbGetMeetingByIdAndOrg(org, meetingId);
        if oldMeeting is () {
            return ();
        }

        Meeting meeting = {id: meetingId, org: org, createdAt: oldMeeting.createdAt, ...updatedMeetingItem};
        Meeting|error updatedMeeting = dbUpdateMeeting(meeting);

        if updatedMeeting is error {
            return updatedMeeting;
        }
        return updatedMeeting;
    } else {
        Meeting? oldeMeetingRecord = meetingRecords[org, meetingId];
        if oldeMeetingRecord is () {
            return ();
        }
        _ = meetingRecords.remove([org, meetingId]);
        meetingRecords.put({id: meetingId, org: org, createdAt: oldeMeetingRecord.createdAt, ...updatedMeetingItem});
        Meeting? meeting = meetingRecords[org, meetingId];
        return meeting;
    }
}

function deleteMeetingById(string org, string meetingId) returns string|()|error {

    if (useDB) {
        return dbDeleteMeetingById(org, meetingId);
    } else {
        Meeting? doctorRecord = meetingRecords[org, meetingId];
        if doctorRecord is () {
            return ();
        }
        _ = meetingRecords.remove([org, meetingId]);
        return "Meeting deleted successfully";
    }
}

function addMeeting(MeetingItem meetingItem, string org) returns Meeting|error {

    string meetingId = uuid:createType1AsString();
    time:Utc currentUtc = time:utcNow();
    time:Civil currentTime = time:utcToCivil(currentUtc);
    string timeString = civilToIso8601(currentTime);

    Meeting doctor = {
        id: meetingId,
        org: org,
        createdAt: timeString,
        ...meetingItem
    };

    if (useDB) {
        return dbAddMeeting(doctor);
    } else {
        meetingRecords.put(doctor);
        Meeting addedDoctor = <Meeting>meetingRecords[org, meetingId];
        return addedDoctor;
    }
}


function getMeetingByIdAndOrg(string org, string meetingId) returns Meeting|()|error {

    if (useDB) {
        return dbGetMeetingByIdAndOrg(org, meetingId);
    } else {
        Meeting? meeting = meetingRecords[org, meetingId];
        if meeting is () {
            return ();
        }
        return meeting;
    }
}

# Converts time:Civil time to string 2022-07-12T05:42:35Z
#
# + time - time:Civil time record.
# + return - Converted ISO 8601 string.
function civilToIso8601(time:Civil time) returns string {
    string year = time.year.toString();
    string month = time.month < 10 ? string `0${time.month}` : time.month.toString();
    string day = time.day < 10 ? string `0${time.day}` : time.day.toString();
    string hour = time.hour < 10 ? string `0${time.hour}` : time.hour.toString();
    string minute = time.minute < 10 ? string `0${time.minute}` : time.minute.toString();

    decimal? seconds = time.second;
    string second = seconds is () ? "00" : (seconds < 10.0d ? string `0${seconds}` : seconds.toString());

    time:ZoneOffset? zoneOffset = time.utcOffset;
    string timeZone = "Z";
    if zoneOffset is time:ZoneOffset {
        if zoneOffset.hours == 0 && zoneOffset.minutes == 0 {
            timeZone = "Z";
        } else {
            string hours = zoneOffset.hours.abs() < 10 ? string `0${zoneOffset.hours.abs()}` : zoneOffset.hours.abs().toString();
            string minutes = zoneOffset.minutes.abs() < 10 ? string `0${zoneOffset.minutes.abs()}` : zoneOffset.minutes.abs().toString();
            timeZone = zoneOffset.hours < 0 ? string `-${hours}${minutes}` : string `+${hours}${minutes}`;
        }
    }
    return string `${year}-${month}-${day}T${hour}:${minute}:${second}${timeZone}`;
}
