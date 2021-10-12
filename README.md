# **Key's personal branch**

## | 数据处理

* 对站点名和站点经纬度进行了唯一对应，并生成自0起唯一对应的id编号
* 主要处理了站点重命名和错误记录站点名的数据，剩余万级直接丢弃处理
* 依照隔壁组的 .shape 文件对站点进行了区域级的划分，并生成供数据库存储的信息表
* 跟指定的边界顶点，划分成用户指定的区域网格，并生成对应的特征向量

## | 处理流程
 1. 先进行站点级别的处理
  * 生成 m_station_data.csv（grid和zone级别处理的数据源)
  * 生成m_station_NYC.csv(用于数据库存储的station信息)
 2. 之后进行zone级别的处理 
  * 更新 m_station_NYC.csv(添加 zone_id 的信息)
  * 生成 zone_NYC.csv(用于数据库的zone信息)
 3. 最后进行grid级别处理

 ## | 文件层次
  * data_processing 数据处理，生成特征向量的 .py .ipynb 文件
    * // 若 .py文件运行错误， 可通过 .ipynb文件进行调试
    * grid_level
    * region_level
    * station_level
  * modified_record
    * <!> m_station_data.csv 文件太大，未上传到 github，可由station_level生成
    * ...
  * processed_data
    * // 数据源的数据是记录到2021年8月，但有订单在九月结束
    故9月的特征结果可以认为无意义

    * *_station.npy (station 级别特征结果）
    * *_zone.npy    (zone 级别特征结果）
    * *_grid.npy    (grid 级别特征结果）
