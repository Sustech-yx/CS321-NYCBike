import pandas as pd
import numpy as np



def dictionary(raw_data):
    dic={}
    set1=set()
    k=0
    for i in range(len(raw_data)):
        if raw_data.loc[i,'start station id'] not in set1:
            set1.add(raw_data.loc[i,'start station id'])
            dic[raw_data.loc[i,'start station id']]=k
            k+=1
    # set1 = set()
    # list1=[]
    # dic={}
    # for i in range(len(raw_data)):
    #     if raw_data.loc[i,'start station id'] not in set1:
    #         set1.add(raw_data.loc[i,'start station id'])
    #         list1.append(raw_data.loc[i,'start station id'])
    # list1.sort()
    # print(len(list1))
    # k=0
    # for i in range(len(list1)):
    #     dic[list1[i]]=k
    return dic

def transform(time_unit, raw_data, days,dic):
    room = np.full((days * (1440 // time_unit), len(dic), 2), 0)
    print(len(room))
    for i in range(len(raw_data)):
        x=raw_data.loc[i,'new_start_time']//time_unit
        y=raw_data.loc[i,'start station id']
        room[x][dic[y]][0]+=1

    for i in range(len(raw_data)):
        x = raw_data.loc[i, 'new_end_time'] // time_unit
        y = raw_data.loc[i, 'start station id']
        room[x][dic[y]][1] += 1

    np.save('2019a.npy',room)
# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    raw_data = pd.read_csv("D:\\bicycle_project\\pra1\\JC-201901-citibike-tripdata.csv")
    raw_data = pd.DataFrame(raw_data)
    #print(raw_data)
    print(raw_data['starttime'])
    raw_data['new_start_time'] = (((raw_data['starttime'].apply(lambda x: x[8:10]))).astype(int)-1) * 24 * 60 + (
    (raw_data['starttime'].apply(lambda x: x[11:13]))).astype(int) * 60 + (
                                 (raw_data['starttime'].apply(lambda x: x[14:16]))).astype(int)


    raw_data['new_end_time'] = (((raw_data['stoptime'].apply(lambda x: x[8:10]))).astype(int)-1) * 24 * 60 + (
    (raw_data['stoptime'].apply(lambda x: x[11:13]))).astype(int) * 60 + (
                               (raw_data['stoptime'].apply(lambda x: x[14:16]))).astype(int)
    map_reduce={}
    dic=dictionary(raw_data)
    raw_data.reset_index(inplace=True, drop=True)
    print(raw_data['new_start_time'].max())
    transform(60, raw_data, 31,dic)
    # #31天
    # transform(1, raw_data2, 31)


