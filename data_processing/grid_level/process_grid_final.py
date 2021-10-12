import pandas as pd
import numpy as np
import datetime as d
import calendar as c
from datetime import timedelta

from data_processing.station_level.process_station_final import read_raw_data

# left vertex
ORIGIN = (40.7062855, -74.0315102)
# top vertex on y axis
Y_AXIS = (40.7738362, -73.9985950)
# bottom vertex on x axis
X_AXIS = (40.6937655, -73.9871323)
# right vertex
PLOY_VTX = (40.7613036, -73.9541783)

X_SIZE = 8
Y_SIZE = 16
DELTA_INCRES = 60

global T_Y_AXIS
global T_X_AXIS
global T_PLOY
global station_data

def read_data_resource():
    global station_data

    use_columns = ['started_at','ended_at','start_station_name','start_lat','start_lng','end_station_name','end_lat','end_lng','start_id','end_id']
    station_data = pd.read_csv('../../modified_record/m_station_data.csv', usecols=use_columns)

def transform_axis_vertex(vertex):
    # normalize vertex
    lat, lng = vertex[0]-ORIGIN[0], vertex[1]-ORIGIN[1]
    n_vertex = np.array((lat, lng))

    # transform vertex
    t_vertex = n_vertex / np.linalg.norm(n_vertex)
    return t_vertex

def transform_all_vertex():
    global T_Y_AXIS
    global T_X_AXIS
    global T_PLOY

    T_Y_AXIS = transform_axis_vertex(Y_AXIS)
    T_X_AXIS = transform_axis_vertex(X_AXIS)

    # norm and transform polygon vertex
    N_PLOY = np.array((PLOY_VTX[0]-ORIGIN[0], PLOY_VTX[1]-ORIGIN[1]))
    T_PLOY = (np.dot(N_PLOY, T_Y_AXIS), np.dot(N_PLOY, T_X_AXIS))

def process_location():
    global T_Y_AXIS
    global T_X_AXIS
    global T_PLOY

    global station_data

    # norm location
    station_data['norm_start_lat'] = station_data['start_lat']-ORIGIN[0]
    station_data['norm_start_lng'] = station_data['start_lng']-ORIGIN[1]
    station_data['norm_end_lat'] = station_data['end_lat']-ORIGIN[0]
    station_data['norm_end_lng'] = station_data['end_lng']-ORIGIN[1]

    # transform location
    station_data['start_x'] = station_data['norm_start_lat'] * T_Y_AXIS[0] + station_data['norm_start_lng'] * T_Y_AXIS[1]
    station_data['start_y'] = station_data['norm_start_lat'] * T_X_AXIS[0] + station_data['norm_start_lng'] * T_X_AXIS[1]
    station_data['end_x'] = station_data['norm_end_lat'] * T_Y_AXIS[0] + station_data['norm_end_lng'] * T_Y_AXIS[1]
    station_data['end_y'] = station_data['norm_end_lat'] * T_X_AXIS[0] + station_data['norm_end_lng'] * T_X_AXIS[1]

    # grid partition
    station_data['start_x_index'] = station_data['start_x'] * X_SIZE // T_PLOY[0]
    station_data['start_y_index'] = station_data['start_y'] * Y_SIZE // T_PLOY[1]
    station_data['end_x_index'] = station_data['end_x'] * X_SIZE // T_PLOY[0]
    station_data['end_y_index'] = station_data['end_y'] * Y_SIZE // T_PLOY[1]
    station_data.drop(['norm_start_lat', 'norm_start_lng', 'norm_end_lat', 'norm_end_lng', 'start_x', 'start_y', 'end_x', 'end_y'], axis=1, inplace = True)

def select_valid_grids():
    global station_data

    station_data = station_data[(station_data['start_x_index'] >= 0) & (station_data['start_x_index'] < X_SIZE)]
    station_data = station_data[(station_data['start_y_index'] >= 0) & (station_data['start_y_index'] < Y_SIZE)]
    station_data = station_data[(station_data['end_x_index'] >= 0) & (station_data['end_x_index'] < X_SIZE)]
    station_data = station_data[(station_data['end_y_index'] >= 0) & (station_data['end_y_index'] < Y_SIZE)]

def data_type_redefine():
    global station_data

    station_data['started_at'] = pd.to_datetime(station_data['started_at'], format='%Y-%m-%d %H:%M:%S')
    station_data['ended_at'] = pd.to_datetime(station_data['ended_at'], format='%Y-%m-%d %H:%M:%S')
    station_data['start_x_index'] = station_data['start_x_index'].astype('int')
    station_data['start_y_index'] = station_data['start_y_index'].astype('int')
    station_data['end_x_index'] = station_data['end_x_index'].astype('int')
    station_data['end_y_index'] = station_data['end_y_index'].astype('int')

def generate_eigenvector():
    global station_data

    # set up container
    current_time = d.datetime(2019, 1, 1)
    end_time = d.datetime(2021, 9, 1)

    result_station = []
    while current_time <= end_time:
        day_num = c.monthrange(current_time.year, current_time.month)[1]
        result_station.append(np.zeros([(1440 // DELTA_INCRES * day_num), X_SIZE, Y_SIZE, 2], dtype=int))
        current_time += timedelta(days=day_num)

    # data traversal
    for i in range(station_data.shape[0]):
        start_id = station_data.loc[i, 'start_id']
        end_id = station_data.loc[i, 'end_id']

        if (not np.isnan(start_id)) and (not np.isnan(end_id)):
            started_at = station_data.loc[i, 'started_at']
            s_0 = (started_at.year-2019)*12 + (started_at.month-1)
            s_1 = ((started_at.day-1)*24*60 + (started_at.hour)*60 + (started_at.minute)) // DELTA_INCRES
            s_2 = station_data.loc[i, 'start_x_index']
            s_3 = station_data.loc[i, 'start_y_index']
            result_station[s_0][s_1][s_2][s_3][0] += 1
        
            ended_at = station_data.loc[i, 'ended_at']
            e_0 = (ended_at.year-2019)*12 + (ended_at.month-1)
            e_1 = ((ended_at.day-1)*24*60 + (ended_at.hour)*60 + (ended_at.minute)) // DELTA_INCRES
            e_2 = station_data.loc[i, 'end_x_index']
            e_3 = station_data.loc[i, 'end_y_index']        
            result_station[e_0][e_1][e_2][e_3][1] += 1

    # generate files
    current_time = d.datetime(2019, 1, 1)
    end_time = d.datetime(2021, 9, 1)

    index = 0
    while current_time <= end_time:
        day_num = c.monthrange(current_time.year, current_time.month)[1]
        np.save(('../../processed_data/{}{:02d}_grid.npy'.format(current_time.year, current_time.month)), result_station[index])
        current_time += timedelta(days=day_num)
        index += 1 

if __name__ == '__main__':
    read_data_resource()
    transform_all_vertex()

    # process location data
    process_location()
    # filter
    select_valid_grids()
    # dtype redefine
    data_type_redefine()

    # generate .npy files
    generate_eigenvector()