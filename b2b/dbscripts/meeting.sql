CREATE DATABASE IF NOT EXISTS MEETING_DB;

CREATE TABLE CHANNEL_DB.Meeting (
      id VARCHAR(255) PRIMARY KEY,
      org VARCHAR(255),
      createdAt VARCHAR(255),
      topic VARCHAR(255),
      date VARCHAR(255),
      startTime VARCHAR(255),
      duration VARCHAR(255),
      timeZone VARCHAR(255)
);