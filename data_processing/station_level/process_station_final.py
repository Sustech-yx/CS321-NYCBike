import os
import pandas as pd 
import numpy as np
import datetime as d
import calendar as c 
from datetime import timedelta

DELTA_INCRES = 60

global station_data
global station_NYC

global raw_dirs
global data_lists
global require_lists


# data has two different form
raw_dirs = ['../../old_raw/', '../../new_raw/']
require_lists = [[['start station name', 'end station name'], ['start station name', 'start station latitude','start station longitude']],
                 [['start_station_name', 'end_station_name'], ['start_station_name', 'start_lat','start_lng']]]

data_lists = [[['start station name', 'end station name'], ['starttime', 'stoptime', 'start station name', 'start station latitude','start station longitude', 'end station name', 'end station latitude','end station longitude']],
              [['start_station_name', 'end_station_name'], ['started_at', 'ended_at', 'start_station_name', 'start_lat','start_lng', 'end_station_name', 'end_lat','end_lng']]]

station_NYC = []
station_data = []

def read_raw_data():
    global station_data
    global raw_dirs
    global data_lists

    for i in range(2):
        files = os.listdir(raw_dirs[i])
        path_list = [(raw_dirs[i] + f) for f in files if f.endswith('.csv')]

        for p in path_list:
            data = pd.read_csv(p, low_memory=False, usecols=data_lists[i][1])
            data = data[data[data_lists[i][0]].notnull().all(1)]
            if i == 0:
                data.rename(columns={'start station name' : 'start_station_name', 'start station latitude' : 'start_lat', 'start station longitude' : 'start_lng',
                                     'end station name' : 'end_station_name', 'end station latitude' : 'end_lat', 'end station longitude' : 'end_lng', 'starttime' : 'started_at', 'stoptime' : 'ended_at'},inplace=True) 
            station_data.append(data)

    station_data = pd.concat(station_data, ignore_index=True)

def read_station_info():
    global station_NYC
    global raw_dirs
    global require_lists

    # construct station table
    for i in range(2):
        files = os.listdir(raw_dirs[i])
        path_list = [(raw_dirs[i] + f) for f in files if f.endswith('.csv')]

        for p in path_list:
            data = pd.read_csv(p, low_memory=False, index=False)
            data = data[data[require_lists[i][0]].notnull().all(1)]
            station_info = data[require_lists[i][1]].drop_duplicates()
            if i == 0:
                station_info.rename(columns={'start station name' : 'start_station_name', 'start station latitude' : 'start_lat', 'start station longitude' : 'start_lng'}, inplace=True) 
            station_NYC.append(station_info)

    station_NYC = pd.concat(station_NYC, ignore_index=True)

def make_location_unique():
    global station_NYC
    global station_data

    station_NYC.drop_duplicates(inplace=True)

    # duplicate groups to handle
    to_list = station_NYC.loc[station_NYC.duplicated(subset=['start_lat','start_lng'],keep=False)].sort_values(['start_lat','start_lng'])
    to_list = to_list.groupby(['start_lat','start_lng'])

    drop_index = []
    correct_name = []
    d_lat, d_lng = [], []
    name, lat, lng = [], [], []
    
    # only handle rename and wrong name situation
    with open('../../modified_record/uniqueness_analysis.txt','w') as f:
        for i, v in to_list:
            loc_data = station_data.loc[(station_data['start_lat'] == i[0]) & (station_data['start_lng'] == i[1])]
            loc_num = loc_data.shape[0]
            correct_name.clear()
            same_loc = True

            for j in range(v.shape[0]):
                item = v.iloc[j,0]

                item_data = station_data.loc[(station_data['start_station_name'] == item)]
                item_lat = item_data.iloc[0,3]
                item_lng = item_data.iloc[0,4]
                
                if item_lat != i[0] or item_lng != i[1]:
                    same_loc = False
                else:
                    correct_name.append(item)

            if same_loc:
                f.write('rename\t\t {}\t {}'.format(i, correct_name[0]))
                drop_index.extend(v.index[1:])
                name.append(correct_name[0])
                lat.append(i[0])
                lng.append(i[1])
            elif len(correct_name):
                f.write('register wrong\t {}\t {}'.format(i, correct_name[0]))
                drop_index.extend(v.index)
                name.append(correct_name[0])
                lat.append(i[0])
                lng.append(i[1])
            else:
                f.write('error data\t {}\t {}'.format(i, loc_num))
                drop_index.extend(v.index)
                d_lat.append(i[0])
                d_lng.append(i[1])
    f.close()

    
    # truncate stations with duplicate location
    station_NYC = station_NYC.drop(index=drop_index)
    # save station info table
    station_NYC.to_csv('../../modified_record/m_station_NYC.csv')

    # record right station name
    for i in range(len(name)):
        station_data.loc[(station_data['start_lat'] == lat[i]) & (station_data['start_lng'] == lng[i]), 'start_station_name'] = name[i]
        station_data.loc[(station_data['end_lat'] == lat[i]) & (station_data['end_lng'] == lng[i]), 'end_station_name'] = name[i]

    # truncate other error data
    for i in range(len(d_lat)):
        station_data.drop(index=station_data[(station_data['start_lat'] == d_lat[i]) & (station_data['start_lng'] == d_lng[i])].index[0])

    # save processed data as resource for zone and grid
    station_data.to_csv('../../modified_record/m_station_data.csv')

    # append station id
    id_map = {v:i for i, v in enumerate(station_NYC['start_station_name'])}
    station_data['start_id'] = station_data['start_station_name'].apply(lambda x: id_map[x] if x in id_map else np.NaN)
    station_data['end_id'] = station_data['end_station_name'].apply(lambda x: id_map[x] if x in id_map else np.NaN)

def data_type_redefine():
    global station_data

    station_data['started_at'] = pd.to_datetime(station_data['started_at'], format='%Y-%m-%d %H:%M:%S')
    station_data['ended_at'] = pd.to_datetime(station_data['ended_at'], format='%Y-%m-%d %H:%M:%S')
    station_data['start_id'] = station_data['start_id'].astype('int')
    station_data['end_id'] = station_data['end_id'].astype('int')

def generate_eigenvector():
    global station_NYC
    global station_data

    # set up container
    current_time = d.datetime(2019, 1, 1)
    end_time = d.datetime(2021, 9, 1)

    result_station = []
    while current_time <= end_time:
        day_num = c.monthrange(current_time.year, current_time.month)[1]
        result_station.append(np.zeros([(1440 // DELTA_INCRES * day_num), station_NYC.shape[0], 2], dtype=int))
        current_time += timedelta(days=day_num)

    # data traversal
    for i in range(station_data.shape[0]):
        start_id = station_data.loc[i, 'start_id']
        end_id = station_data.loc[i, 'end_id']

        if (not np.isnan(start_id)) and (not np.isnan(end_id)):
            started_at = station_data.loc[i, 'started_at']
            s_0 = (started_at.year-2019)*12 + (started_at.month-1)
            s_1 = ((started_at.day-1)*24*60 + (started_at.hour)*60 + (started_at.minute)) // DELTA_INCRES
            result_station[s_0][s_1][start_id][0] += 1
        
            ended_at = station_data.loc[i, 'ended_at']
            e_0 = (ended_at.year-2019)*12 + (ended_at.month-1)
            e_1 = ((ended_at.day-1)*24*60 + (ended_at.hour)*60 + (ended_at.minute)) // DELTA_INCRES    
            result_station[e_0][e_1][end_id][1] += 1

    # generate files
    current_time = d.datetime(2019, 1, 1)
    end_time = d.datetime(2021, 9, 1)

    index = 0
    while current_time <= end_time:
        day_num = c.monthrange(current_time.year, current_time.month)[1]
        np.save(('../../processed_data/{}{:02d}_station.npy'.format(current_time.year, current_time.month)), result_station[index])
        current_time += timedelta(days=day_num)
        index += 1 

if __name__ == '__main__':
    read_station_info()
    read_raw_data()

    make_location_unique()

    data_type_redefine()
    generate_eigenvector()