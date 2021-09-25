CREATE TABLE IF NOT EXISTS 'Region_table'(
    'region_id' INT INCREMENT,
    'region_name' VARCHAR(100),
    PRIMARY KEY ('region_id')
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS 'Station_table'(
    'station_id' VARCHAR(100) NOT NULL,
    'station_name' VARCHAR(100) NOT NULL,
    'region_id' VARCHAR(100) NOT NULL,
    'Lat_Deg' NUMBER NOT NULL,
    'Lat_Min' NUMBER NOT NULL,
    'Lat_Sec' NUMBER NOT NULL,
    'Lon_Deg' NUMBER NOT NULL,
    'Lon_Min' NUMBER NOT NULL,
    'Lon_Sec' NUMBER NOT NULL,
    PRIMARY KEY ('station_id')
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS 'Order_table'(
    'order_id' INT INCREMENT,
    'start_station_id' VARCHAR(100) NOT NULL,
    'end_station_id' VARCHAR(100) NOT NULL,
    'start_time' DATETIME_INTERVAL_CODE NOT NULL,
    'end_time' DATETIME_INTERVAL_CODE NOT NULL,
    'trip_duration' INT NOT NULL,
    'bike_id' VARCHAR(100) NOT NULL,
    'gender' SMALLINT NOT NULL,
    'usertype' VARCHAR(10) NOT NULL,
    'birth_year' INT NOT NULL,
    PRIMARY KEY ('order_id')
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
