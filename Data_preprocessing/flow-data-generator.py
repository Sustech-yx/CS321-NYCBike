import numpy as npy
import pandas as pd


def check_month(yyyymm: str) -> int:
    year = int(yyyymm[0:3])
    month = int(yyyymm[4:5])
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


def generate(yyyymm: str):
    input_path = '../raw_data/JC-{}-citibike-tripdata.csv'.format(yyyymm)
    df = pd.read_csv(input_path)
    exist_station_id = list(df['start station id'].drop_duplicates())
    tmp = list(df['end station id'].drop_duplicates())
    exist_station_id.extend(tmp)
    exist_station_id = list(set(exist_station_id))
    T = check_month(yyyymm) * 24
    N = len(exist_station_id)
    C = 3
    print('T={}, N={}, C={}'.format(T, N, C))
    pass


def main():
    generate(str(201901))


if __name__ == '__main__':
    main()
