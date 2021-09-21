import numpy as npy
import pandas as pd


def check_month(yyyymm: str) -> int:
    year = int(yyyymm[0:4])
    month = int(yyyymm[4:6])
    d: int
    if month in [1, 3, 5, 7, 8, 10, 12]:
        d = 31
    elif month == 2:
        if year % 4 == 0 and year % 100 != 0 or year % 400 == 0:
            d = 29
        else:
            d = 28
    else:
        d = 30
    return d


def get_time_slot(dtime: str) -> int:
    day = int(dtime[8:10])
    hour = int(dtime[11:13])
    return (day - 1) * 24 + hour
    pass


def generate(yyyymm: str):
    input_path = '../raw_data/JC-{}-citibike-tripdata.csv'.format(yyyymm)
    output_path = '../output/{}_data.npy'.format(yyyymm)
    df = pd.read_csv(input_path)
    exist_station_id = list(df['start station id'].drop_duplicates())
    tmp = list(df['end station id'].drop_duplicates())
    exist_station_id.extend(tmp)
    exist_station_id = list(set(exist_station_id))
    T = check_month(yyyymm) * 24
    N = len(exist_station_id)
    C = 3
    # print('T={}, N={}, C={}'.format(T, N, C))
    res = npy.zeros([T, N, C], dtype=npy.int8)
    for row in df.iterrows():
        # print(type(row))
        s_id = row[1][3]  # row['start station id']
        e_id = row[1][7]  # row['end station id']
        s_time = get_time_slot(row[1][1])  # get_time_slot(row['starttime'])
        e_time = get_time_slot(row[1][2])  # get_time_slot(row['endtime'])
        # print(exist_station_id.index(s_id), s_time, 0)
        res[s_time, exist_station_id.index(s_id), 0] += 1
        res[e_time, exist_station_id.index(e_id), 1] += 1
    res[:, :, 2] = res[:, :, 0] + res[:, :, 1]
    npy.save(output_path, res)
    pass


def main():
    generate(str(201901))


if __name__ == '__main__':
    main()
