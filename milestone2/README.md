# Milestone 2

## Requirements:

- Docker
- docker-compose utility function

## Setup:

To run the project, the following commands should run inside `milestone2` folder:

```
make start
```
The above command is used to start the services. To start-up of the services take around 10 minutes, as the data should be indexed in the database.

```
make stop
```
The above command is used to stop the services.

To be sure that the website started and the database contains everything. Please search a similar log:
```
NETWORK  [conn1] received client metadata from 172.18.0.3:60712 conn1: { driver: { name: "PyMongo", version: "4.1.1" }, os: { type: "Linux", name: "Linux", architecture: "x86_64", version: "6.5.0-27-generic" }, platform: "CPython 3.6.15.final.0" }
```