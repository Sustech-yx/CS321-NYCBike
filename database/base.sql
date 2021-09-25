CREATE TABLE IF NOT EXISTS 'Station_table'(
    'station_id' VARCHAR(100) NOT NULL,
    'station_name' VARCHAR(100) NOT NULL,
    'Lat_Deg' NUMBER NOT NULL,
    'Lat_Min' NUMBER NOT NULL,
    'Lat_Sec' NUMBER NOT NULL,
    'Lon_Deg' NUMBER NOT NULL,
    'Lon_Min' NUMBER NOT NULL,
    'Lon_Sec' NUMBER NOT NULL,
    PRIMARY KEY ('station_id')
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS 'Order_table'(
    'order_id' VARCHAR(100) NOT NULL,

)ENGINE=InnoDB DEFAULT CHARSET=utf8;