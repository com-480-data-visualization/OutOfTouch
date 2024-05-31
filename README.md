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
  
  [**Milestone 1**](#milestone-1) • [**Milestone 2**](#milestone-2) • [**Milestone 3**](#milestone-3)
  
</span>


## Milestone 1

<span align="justify">

### Dataset
We will visualize 2 means of transport in New York City: taxis and bikes. The analysis and visualizations will be complementary focused on the following 3 periods: pre-, during, and post-COVID-19 pandemic.

_Note: The datasets were filtered to contain entries only between 2019-2022 corresponding to the COVID-19 pandemic period._

- **Taxi Rides**: [NYC Open Data](https://opendata.cityofnewyork.us/data/) ([2019](https://data.cityofnewyork.us/Transportation/2019-Green-Taxi-Trip-Data/q5mz-t52e/about_data), [2020](https://data.cityofnewyork.us/Transportation/2020-Green-Taxi-Trip-Data/pkmi-4kfn/about_data), [2021](https://data.cityofnewyork.us/Transportation/2021-Green-Taxi-Trip-Data/djnb-wcxt/about_data), [2022](https://data.cityofnewyork.us/Transportation/2022-Green-Taxi-Trip-Data/8nfn-ifaj/about_data))

  Contains the zones and timestamps for pickup and dropoff as well as the cost of the ride, broken into multiple parts such as ``fare_amount``, ``tolls_amount``, ``tip_amount``, and others:

  
  <table border="0" cellspacing="0" cellpadding="0" bgcolor="#fff">
    <tr>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>lpep_pickup_datetime</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>lpep_dropoff_datetime</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>PULocationID</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>DOLocationID</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>trip_distance</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>fare_amount</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>extra</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>mta_tax</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>tip_amount</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>tolls_amount</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>improvement_surcharge</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>total_amount</strong></td>
    </tr>
  </table>

  The above columns are final after filtering out the data related to gender and type of payment. To maintain the correctness of our data, we kept the entries where the ``trip_distance`` is between 0 and 100 miles. This dataset includes 2 special zones (**Unknown** and **Outside of NY**), which were removed from the final dataset.

    
- **Bike Rides**: [City Bike NYC](https://s3.amazonaws.com/tripdata/index.html)

  Contains precise timestamps and geolocation of the start and end of a bike ride.

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

  The size of this dataset was initially 10Gb, restraining our storage capacities. Therefore, we decided to load every 10th row, but still represent an equivalent data distribution as the original dataset, shrinking the dataset to 1Gb. To compare the statistics with the taxi dataset, based on the geolocations, 5 new fields are computed and added as part of the final dataset: start/end zone, borough, and distance traveled. Moreover, the original dataset contained different formats to store the data. So, we processed the data to be represented in one format.
  
- **Bike Accidents**: [Crashes From NYC](https://data.cityofnewyork.us/Public-Safety/Motor-Vehicle-Collisions-Crashes/h9gi-nx95/about_data)

  This dataset contains 28205 bike accidents and their location and time of happening. Initially, it contained 30 features, but we found only 6 relevant to our analysis.

  <table border="0" cellspacing="0" cellpadding="0" bgcolor="#fff">
    <tr>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>crash_data</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>crash_time</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>location</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>latitude</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>longitude</strong></td>
      <td cellspacing="0" cellpadding="0" colspan="3"><strong>borough</strong></td>
    </tr>
  </table>


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
      <td cellspacing="0" cellpadding="0" colspan="3">960MB</td>
      <td cellspacing="0" cellpadding="0" colspan="3">9,7M</td>
      <td cellspacing="0" cellpadding="0" colspan="3">0</td>
      <td cellspacing="0" cellpadding="0" colspan="3">0</td>
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
      <td cellspacing="0" cellpadding="0" colspan="3">5.9MB</td>
      <td cellspacing="0" cellpadding="0" colspan="3">28205</td>
      <td cellspacing="0" cellpadding="0" colspan="3">1553</td>
      <td cellspacing="0" cellpadding="0" colspan="3">0</td>
    </tr>
  </table>
</span>

The preprocessed pickle datasets and original CSV files can be downloaded [here](https://drive.google.com/drive/folders/1hmMFQZv9bhhLF59HKuDqunWa0mdX2IEA?usp=sharing)!

### Problematic

<span align='justify'>

In this project, we want to show how the pandemic influences human behavior in terms of 2 public means of transport, taxis, and bikes, in a big metropole such as New York City (NYC). From different perspectives, we present human patterns in terms of using taxis or bikes. Analyzing datasets related to taxis, public bikes, and bike accidents over different periods (pre-pandemic, pandemic, and post-pandemic) can provide insights into the pandemic's impact on transportation patterns, urban mobility, and road safety. Thus, we split our motivation part into 2 main directions:

1.**Transportation Behavior Changes**: we explore how transportation behavior changed during different phases of the pandemic by analyzing trends in taxi usage, public bike rentals, and bike accidents to identify shifts in commuting patterns, travel distances, and popular routes. Furthermore, we want to visualize how mobility patterns evolved over time. Thus, we focus on a spatial analysis (the most frequent regions and where people are going) and a timeline analysis (when people prefer to use taxis or bikes). Our target audience is sociologists who want to know the impact of the pandemic on human behavior. Moreover, perhaps the mayor of NYC is interested in this aspect since he can implement new city traffic measurements (extend the public bike network if people prefer to use bikes instead of taxies)

2.**Impact on Road Safety**: we analyze trends in bike accidents during the pre-pandemic, pandemic, and post-pandemic periods and verify if there are any correlations between changes in transportation behavior and the frequency of bike accidents. Moreover, we check if there are hotspots with many taxi and bike routes and bike accidents. This analysis can help policymakers implement targeted road safety measures and help police implement new transport flow to avoid those incidents. Additionally, any citizen of NYC might be interested in visualizing this aspect to prevent those hotspots and specific routing times.


### Exploratory Data Analysis

The notebooks associated with the data analysis are located under the ``/src`` folder. Each dataset is processed in a separate notebook file for the current milestone, but the main visualizations displayed in this section are done in the ```Milestone 1``` notebook. The analysis focuse around changing behaviors in terms of means of transport in NYC, specifically during the COVID-19 pandemic period.

Clearly, the number of taxi rides drastically dropped at the start of the pandemic, with the decrease trend continuing to 2022. However, the number of bike rides has slightly increased, with a recurrent pattern of rises and falls depending on the season.

![](/images/rides_per_year_month.png)

We plot a heatmap over an NYC map, showing the distribution of the taxi (left) and bike (right) start locations before COVID-19. We see that taxi rides span a bigger area of the city. In this project, we will analyze how this distribution trend changes.

<div style="display: flex">
    <img src="/images/taxi_heatmap_before_covid.png" width="49%" height="500" />
    <img src="/images/bike_heatmap_before_covid.png" width="50%" height="500"/>
</div>
<br>

We also want to see if the number of bike crashes influences the renting of public bikes and taxis. So, we check if there is a correlation between the renting duration service and bike crashes. Even if most bike accidents were in the summer, people still used the public bike service, registering the longest trips occurring during this period. The average duration of the taxi rides does not follow a pattern.

![](/images/average_duration_per_month.png)

Based on the confusion matrix of bike crashes, we see that Friday evening is the riskiest day to hop on a bike, and it is much safer to travel in the mornings.

![](/images/accidents_weekday_time_of_day.png)

Throughout this project, we will also dive deeper into the zones and boroughs of NYC, analyzing specific trends for specific parts of the city. Here is an overview of the spread of NYC zones and a list of the busiest regions regarding bike rides.

![](/images/Zones_NYC.png)

<div style="display: flex">
    <img src="/images/top_10_boroughs_most_rides.png" width="49%" height="300" />
    <img src="/images/top_10_zones_most_rides.png" width="50%" height="300"/>
</div>
<br>

For a more detailed analysis, please look at the provided notebooks. All plots can be found under the folder ```/images``` and the HTML version of the maps are available under ```/maps```. <br>
_Note: GitHub does not render the maps. Run the notebooks locally or open the HTML versions to see the high-quality interactive maps._

### Related work

<span align="justify">

The data we are working with originates from public datasets where taxi drivers and bicycle riders have given consent to store per-ride statistics in an open NYC database. Numerous companies involved in transportation services may utilize this information for various purposes, such as improving service quality, predicting ride prices, or identifying busy and profitable regions [[1]](https://github.com/doshiharmish/NYC-Green-Taxi-Trip-Analysis). Additionally, analyses have often focused on enhancing drivers' experiences by helping them locate the most profitable zones and busiest hours throughout the day [[2]](https://medium.com/web-mining-is688-spring-2021/green-taxi-analysis-nyc-bb67b482d9e). Some show simple exploratory analysis of the dataset (similar to what we are doing in ```Milestone 1```) [[3]](https://medium.com/@fathurizkym27/analysis-of-the-nyc-green-taxi-data-e37640534730). These existing analyses have provided us with valuable insights into the dataset's potential, guiding our approach and visualizations.

Our project's uniqueness lies in its inclusive approach. Beyond merely analyzing taxi rides, we also incorporate data on bicycle rides and examine how the COVID-19 crisis impacted both modes of transportation. Furthermore, we explore trends in shifting between these modes of transport in recent years. An innovative aspect of our analysis is the integration of bicycle accident data. We investigate whether shifting trends in transportation modes have led to an increase in severe accidents.

We drew inspiration from various sources to craft our approach, including previous analyses, research, and visualizations found in other online domains ([[1]](https://github.com/doshiharmish/NYC-Green-Taxi-Trip-Analysis), [[2]](https://medium.com/web-mining-is688-spring-2021/green-taxi-analysis-nyc-bb67b482d9e), [[3]](https://medium.com/@fathurizkym27/analysis-of-the-nyc-green-taxi-data-e37640534730)). While existing analyses provided a foundation, our project expands upon this by offering a comprehensive examination of the interplay between taxi and bicycle transportation and the impact of external factors such as the COVID-19 crisis.

</span>

## Milestone 2

### Architecture

The architecture of our web-page contains the following components:

* **Backend Server** - implemented in `Python` using the `Flask` framework. This component handles requests coming from the frontend server and converts them into queries to retrieve data from the database.
* **Frontend** - implemented in `Javascript`, leveraging static assets specified in `HTML` and `CSS`. Moreover, it handles preprocessed data from the server and implements a caching strategy to limit unnecessary server and database calls, thereby enhancing efficiency.
* **MongoDB** - database used for storing data and efficient search. 

### Deliverables

The implementation of our prototype website can be found in folder [milestone2](https://github.com/com-480-data-visualization/OutOfTouch/tree/master/milestone2).

To reproduce our website please follow the instructions from [here](https://github.com/com-480-data-visualization/OutOfTouch/blob/master/milestone2/README.md).

The report for this milestone can be found [here](https://github.com/com-480-data-visualization/OutOfTouch/blob/master/milestone2/Milestone2.pdf).

## Milestone 3

The used data is available [here](https://drive.google.com/drive/folders/1zd5pfRjVlyb2tbWu4nTnZTwUkrU_ITZN?usp=drive_link) and should be placed in a folder called data in the root of the project.

The website is available at the following address: [http://out-of-touch.link](http://out-of-touch.link). Due to the limitations of resources on the AWS EC2, there might be some delays. So, for a better experience, please try it locally. For best performance we recommand mozilla, whereas there might be unexpected behaviour for other browsers.

The processed book can be found [here](https://drive.google.com/file/d/1WJ5Uk6u_I1Fo7D94PMU_0sQSnhoQbzQi/view).

The screencast is available [here](https://drive.google.com/file/d/1TM0eS6-RqUqtHjS_qlIqYiS3FXGMrm7u/view?usp=sharing).

The code associated with the regressions that we used, can be found [here](https://github.com/com-480-data-visualization/OutOfTouch/tree/master/src).

## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

