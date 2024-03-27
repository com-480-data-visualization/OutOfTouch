<span align='center'>
  
  # :taxi: Means of Transport: A Data Visualization Project :bike:

<table border="0" align="center" cellspacing="0" cellpadding="0" bgcolor="#fff">
  <tr>
    <td cellspacing="0" cellpadding="0" colspan="3"><strong>Group Name</strong></br>Out of Touch</td>
  </tr>
  <tr>
    <td cellspacing="0" cellpadding="0"><strong>Bojan Lazarevski</strong></br>375261</td>
    <td cellspacing="0" cellpadding="0"><strong>Rares-Stefan Epure</strong></br>359773</td>
    <td cellspacing="0" cellpadding="0"><strong>Cristian-Alexandru Botocan
</strong></br>358786</td>
  </tr>
</table>
  
  *As part of the course "Data Visualization COM-480" at EPFL*
  
  [**Milestone 1**](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)
  
</span>


## Milestone 1

### Dataset
We will visualize 2 means of transport in New York City, taxi and bike rides. The analysis and visualizations will be complementary focused on the following 3 periods: pre, during and post COVID pandemic.

_Note: The datasets were filtered to contain entries only between 2019-2022 corresponding to the COVID pandemic period._

- **Taxi Rides**: [NYC Open Data](https://opendata.cityofnewyork.us/data/) ([2019](https://data.cityofnewyork.us/Transportation/2019-Green-Taxi-Trip-Data/q5mz-t52e/about_data), [2020](https://data.cityofnewyork.us/Transportation/2020-Green-Taxi-Trip-Data/pkmi-4kfn/about_data), [2021](https://data.cityofnewyork.us/Transportation/2021-Green-Taxi-Trip-Data/djnb-wcxt/about_data), [2022](https://data.cityofnewyork.us/Transportation/2022-Green-Taxi-Trip-Data/8nfn-ifaj/about_data))
    
- **Bike Rides**: [City Bike NYC](https://s3.amazonaws.com/tripdata/index.html)

  Contains precise timestamp and geolocation of the start and end of a bike ride.

  <table border="0" cellspacing="0" cellpadding="0" bgcolor="#fff">
    <tr>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>starttime</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>stoptime</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>start_lat</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>start_lng</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>end_lat</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>end_lng</strong></td>
    </tr>
  </table>

  The size of this dataset was initially 10Gb, restraining our storage capacities. Therefore, we decide to load every 10th row, but still represent an equivalent data distribution as the original dataset, shrkinging the dataset to 1Gb. In order to compare the statistics with the taxi dataset, based on the geolocations, 5 new fields are computed and added as part of the final dataset: start/end zone and borough and distance travelled. The dataset contains very little NaN and duplicate values.
  
- **Bike Accidents**: [Crashes From NYC](https://data.cityofnewyork.us/Public-Safety/Motor-Vehicle-Collisions-Crashes/h9gi-nx95/about_data)

  The last dataset used comprises all the crashes from NYC from 2016 until now. So, we filtered the dataset in order to keep just the accidents which involves at least one bicycle and occurred between 2019 and 2022.

_General initial statistics of the datasets:_

<table border="0" cellspacing="0" cellpadding="0" bgcolor="#fff">
    <tr>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>Dataset</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>Size</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>Entries</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>NaNs</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>Duplicates</strong></td>
    </tr>
    <tr>
      <td cellspacing="0" cellpadding="0" colspan="3">Taxi Rides</td>
      <td cellspacing="0" cellpadding="0" colspan="3"></td>
      <td cellspacing="0" cellpadding="0" colspan="3"></td>
      <td cellspacing="0" cellpadding="0" colspan="3"></td>
      <td cellspacing="0" cellpadding="0" colspan="3"></td>
    </tr>
    <tr>
      <td cellspacing="0" cellpadding="0" colspan="3">Bike Rides</td>
      <td cellspacing="0" cellpadding="0" colspan="3">10GB</td>
      <td cellspacing="0" cellpadding="0" colspan="3">100M</td>
      <td cellspacing="0" cellpadding="0" colspan="3">9772</td>
      <td cellspacing="0" cellpadding="0" colspan="3">24</td>
    </tr>
    <tr>
      <td cellspacing="0" cellpadding="0" colspan="3">Bike Accidents</td>
      <td cellspacing="0" cellpadding="0" colspan="3"></td>
      <td cellspacing="0" cellpadding="0" colspan="3"></td>
      <td cellspacing="0" cellpadding="0" colspan="3"></td>
      <td cellspacing="0" cellpadding="0" colspan="3"></td>
    </tr>
  </table>

### Problematic

> Frame the general topic of your visualization and the main axis that you want to develop.
> - What am I trying to show with my visualization?
> - Think of an overview for the project, your motivation, and the target audience.

### Exploratory Data Analysis

> Pre-processing of the data set you chose
> - Show some basic statistics and get insights about the data

### Related work


> - What others have already done with the data?
> - Why is your approach original?
> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
> - In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class.

## Milestone 2 (26th April, 5pm)

**10% of the final grade**


## Milestone 3 (31st May, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

