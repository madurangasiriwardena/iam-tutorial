import ballerinax/java.jdbc;
import ballerinax/mysql.driver as _;
import ballerina/uuid;
import ballerina/sql;
import ballerina/log;
import ballerinax/mysql;
import ballerina/time;
import ballerina/http;
import ballerina/random;

configurable string dbHost = "localhost";
configurable string dbUsername = "admin";
configurable string dbPassword = "admin";
configurable string dbDatabase = "CHANNEL_DB";
configurable int dbPort = 3306;
configurable string emailService = "localhost:9090";

table<Meeting> key(org, id) meetingRecords = table [];
table<Booking> key(org, id) bookingRecords = table [];
table<OrgInfo> key(orgName) orgRecords = table [];

final mysql:Client|error dbClient;
boolean useDB = false;
map<Thumbnail> thumbnailMap = {};

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

    // if (useDB) {
    //     return dbGetDoctorsByOrg(org);
    // } else {
        Meeting[] meetingList = [];
        meetingRecords.forEach(function(Meeting meeting) {
            if meeting.org == org {
                meetingList.push(meeting);
            }
        });
        return meetingList;
    // }
}

function updateMeetingById(string org, string meetingId, MeetingItem updatedMeetingItem) returns Meeting|()|error {

    // if (useDB) {
    //     Meeting|() oldDoctor = check dbGetDoctorByIdAndOrg(org, meetingId);
    //     if oldDoctor is () {
    //         return ();
    //     }

    //     Meeting doctor = {id: meetingId, org: org, createdAt: oldDoctor.createdAt, ...updatedMeetingItem};
    //     Doctor|error updatedDoctor = dbUpdateDoctor(doctor);

    //     if updatedDoctor is error {
    //         return updatedDoctor;
    //     }
    //     return updatedDoctor;
    // } else {
        Meeting? oldeMeetingRecord = meetingRecords[org, meetingId];
        if oldeMeetingRecord is () {
            return ();
        }
        _ = meetingRecords.remove([org, meetingId]);
        meetingRecords.put({id: meetingId, org: org, createdAt: oldeMeetingRecord.createdAt, ...updatedMeetingItem});
        Meeting? meeting = meetingRecords[org, meetingId];
        return meeting;
    // }
}

function deleteMeetingById(string org, string meetingId) returns string|()|error {

    // if (useDB) {
    //     return dbDeleteDoctorById(org, meetingId);
    // } else {
        Meeting? doctorRecord = meetingRecords[org, meetingId];
        if doctorRecord is () {
            return ();
        }
        _ = meetingRecords.remove([org, meetingId]);
        return "Meeting deleted successfully";
    // }
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

    // if (useDB) {
    //     return dbAddDoctor(doctor);
    // } else {
        meetingRecords.put(doctor);
        Meeting addedDoctor = <Meeting>meetingRecords[org, meetingId];
        return addedDoctor;
    // }
}


function getMeetingByIdAndOrg(string org, string meetingId) returns Meeting|()|error {

    // if (useDB) {
    //     return dbGetBookingsByOrgAndId(org, meetingId);
    // } else {
        Meeting? meeting = meetingRecords[org, meetingId];
        if meeting is () {
            return ();
        }
        return meeting;
    // }
}

function getOrgInfo(string org) returns OrgInfo|()|error {

    if (useDB) {
        return dbGetOrgInfoByOrg(org);
    } else {
        OrgInfo? orgInfo = orgRecords[org];
        if orgInfo is () {
            return ();
        }
        return orgInfo;
    }
}

function updateOrgInfo(string org, OrgInfoItem orgInfoItem) returns OrgInfo|error {

    OrgInfo orgInfo = {
        orgName: org,
        ...orgInfoItem
    };

    if (useDB) {
        return dbUpdateOrgInfoByOrg(orgInfo);
    } else {
        orgRecords.put(orgInfo);
        OrgInfo updatedOrgInfo = <OrgInfo>orgRecords[org];
        return updatedOrgInfo;
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

function getThumbnailKey(string org, string doctorId) returns string {
    return org + "-" + doctorId;
}

function sendEmail(Booking booking, Doctor doctor) returns error? {

    http:Client httpClient = check new (emailService);

    string emailSubject = "[Pet Care App][Booking Confirmation] Your booking is confirmed.";
    string emailAddress = booking.emailAddress;

    Property[] properties = [
        addProperty("currentDate", getCurrentDate()),
        addProperty("emailAddress", emailAddress),
        addProperty("bookingId", booking.referenceNumber),
        addProperty("appointmentDate", booking.date),
        addProperty("appointmentTimeSlot", booking.sessionStartTime + " - " + booking.sessionEndTime),
        addProperty("appointmentNo", booking.appointmentNumber.toString()),
        addProperty("appointmentFee", "$30"),
        addProperty("petName", booking.petName),
        addProperty("petType", booking.petType),
        addProperty("petDoB", booking.petDoB),
        addProperty("doctorName", doctor.name),
        addProperty("doctorSpecialty", doctor.specialty),
        addProperty("hospitalName", "Hospital Name"),
        addProperty("hospitalAddress", "Hospital Address"),
        addProperty("hospitalTelephone", "Hospital Telephone")
    ];

    EmailContent emailContent = {
        emailType: BOOKING_CONFIRMED,
        receipient: emailAddress,
        emailSubject: emailSubject,
        properties: properties
    };

    http:Request request = new;
    request.setJsonPayload(emailContent);
    http:Response response = check httpClient->/messages.post(request);

    if (response.statusCode == 200) {
        return;
    }
    else {
        return error("Error while sending email, " + response.reasonPhrase);
    }
}

function addProperty(string name, string value) returns Property {
    Property prop = {name: name, value: value};
    return prop;
}

function getCurrentDate() returns string {
    time:Utc currentUtc = time:utcNow();
    time:Civil currentTime = time:utcToCivil(currentUtc);

    string year;
    string month;
    string day;
    [year, month, day] = getDateFromCivilTime(currentTime);

    int|error currentMonth = int:fromString(month);
    if (currentMonth is error) {
        log:printError("Error while converting month to int: " + currentMonth.toString());
        return "";
    }
    return getMonthName(currentMonth) + " " + day + ", " + year;
}

function getDateFromCivilTime(time:Civil time) returns [string, string, string] {

    string year = time.year.toString();
    string month = time.month < 10 ? string `0${time.month}` : time.month.toString();
    string day = time.day < 10 ? string `0${time.day}` : time.day.toString();
    return [year, month, day];
}

function getMonthName(int index) returns string {
    match index {
        1 => {
            return "January";
        }
        2 => {
            return "February";
        }
        3 => {
            return "March";
        }
        4 => {
            return "April";
        }
        5 => {
            return "May";
        }
        6 => {
            return "June";
        }
        7 => {
            return "July";
        }
        8 => {
            return "August";
        }
        9 => {
            return "September";
        }
        10 => {
            return "October";
        }
        11 => {
            return "November";
        }
        12 => {
            return "December";
        }
        _ => {
            return "";
        }
    }
}

function getReferenceNumber() returns string {

    time:Utc currentUtc = time:utcNow();
    time:Civil currentTime = time:utcToCivil(currentUtc);

    string year;
    string month;
    string day;
    [year, month, day] = getDateFromCivilTime(currentTime);
    int|random:Error randomInteger = random:createIntInRange(1000, 10000);

    if (randomInteger is random:Error) {
        log:printError("Error while generating random number: " + randomInteger.toString());
        return year + month + day + "xxxxx";
    }

    return year + month + day + randomInteger.toString();
}
