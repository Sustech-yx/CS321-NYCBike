import pandas as pd
import numpy as np
import datetime as d
import calendar as c 
import geopandas as gp
from datetime import timedelta

DELTA_INCRES = 60

global station_data
global station_NYC
global zone_NYC

def add_zone_info():
    global station_NYC
    global zone_NYC

    shape = gp.read_file('../../zones/zones.shp').to_crs('EPSG:4326')

    # update station table
    station_NYC = pd.read_csv('../../modified_record/m_station_NYC.csv', usecols=['start_station_name','start_lat','start_lng'])
    geo_station_NYC = gp.GeoDataFrame(station_NYC, geometry=gp.points_from_xy(station_NYC['start_lng'], station_NYC['start_lat']), crs='EPSG:4326')

    station_NYC = gp.sjoin(geo_station_NYC, shape, how='left')
    station_NYC.drop(['geometry','index_right','OBJECTID','Shape_Leng','Shape_Area','zone','borough'], axis=1, inplace=True)
    station_NYC.rename(columns={'start_station_name':'station_name', 'start_lat':'station_lat', 'start_lng':'station_lng', 'LocationID':'zone_id'}, inplace=True)

    station_NYC.to_csv('../../modified_record/m_station_NYC.csv')

    # create zone table
    zone_NYC = shape.drop(['geometry','OBJECTID'], axis=1)
    zone_NYC.rename(columns={'Shape_Leng':'zone_leng', 'Shape_Area':'zone_area', 'zone':'zone_area', 'borough':'zone_borough', 'LocationID':'zone_id'}, inplace=True)
    zone_NYC.to_csv('../../modified_record/zone_NYC.csv')

def read_data_resource():
    global station_data

    use_columns = ['started_at','ended_at','start_station_name','start_lat','start_lng','end_station_name','end_lat','end_lng','start_id','end_id']
    station_data = pd.read_csv('../../modified_record/m_station_data.csv', usecols=use_columns)

def zone_partition():
    global station_data
    global station_NYC

    zone_map = {station_NYC.loc[i,'station_name'] : station_NYC.loc[i, 'zone_id'] for i in range(station_NYC.shape[0])}
    station_data['start_zone'] = station_data['start_station_name'].apply(lambda x: zone_map[x] if x in zone_map else np.NaN)
    station_data['end_zone'] = station_data['end_station_name'].apply(lambda x: zone_map[x] if x in zone_map else np.NaN)

def data_type_redefine():
    global station_data

    station_data['started_at'] = pd.to_datetime(station_data['started_at'], format='%Y-%m-%d %H:%M:%S')
    station_data['ended_at'] = pd.to_datetime(station_data['ended_at'], format='%Y-%m-%d %H:%M:%S')
    station_data['start_zone'] = station_data['start_zone'].astype('int')
    station_data['end_zone'] = station_data['end_zone'].astype('int')

def generate_eigenvector():
    global station_data
    global station_NYC
    global zone_NYC

    # set up container
    current_time = d.datetime(2019, 1, 1)
    end_time = d.datetime(2021, 9, 1)

    result_station = []
    while current_time <= end_time:
        day_num = c.monthrange(current_time.year, current_time.month)[1]
        result_station.append(np.zeros([(1440 // DELTA_INCRES * day_num), zone_NYC.shape[0], 2], dtype=int))
        current_time += timedelta(days=day_num)

    # data traversal
    for i in range(station_data.shape[0]):
        start_zone = station_data.loc[i, 'start_zone']
        end_zone = station_data.loc[i, 'end_zone']

        if (not np.isnan(start_zone)) and (not np.isnan(end_zone)):
            started_at = station_data.loc[i, 'started_at']
            s_0 = (started_at.year-2019)*12 + (started_at.month-1)
            s_1 = ((started_at.day-1)*24*60 + (started_at.hour)*60 + (started_at.minute)) // DELTA_INCRES
            result_station[s_0][s_1][start_zone-1][0] += 1
        
            ended_at = station_data.loc[i, 'ended_at']
            e_0 = (ended_at.year-2019)*12 + (ended_at.month-1)
            e_1 = ((ended_at.day-1)*24*60 + (ended_at.hour)*60 + (ended_at.minute)) // DELTA_INCRES
            result_station[e_0][e_1][end_zone-1][1] += 1

    # generate files
    current_time = d.datetime(2019, 1, 1)
    end_time = d.datetime(2021, 9, 1)

    index = 0
    while current_time <= end_time:
        day_num = c.monthrange(current_time.year, current_time.month)[1]
        np.save(('../../processed_data/{}{:02d}_zone.npy'.format(current_time.year, current_time.month)), result_station[index])
        current_time += timedelta(days=day_num)
        index += 1 

if __name__ == '__main__':
    add_zone_info()

    read_data_resource()
    zone_partition()

    data_type_redefine()
    generate_eigenvector()