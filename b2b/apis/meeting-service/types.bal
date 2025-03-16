type MeetingItem record {|
    string topic;
    string date;
    string startTime;
    string duration;
    string timeZone;
|};

type Meeting record {|
    *MeetingItem;
    readonly string id;
    readonly string org;
    readonly string createdAt;
|};
