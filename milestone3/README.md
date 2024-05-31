# Milestone 3

## Requirements:

To be able to reproduce our environment, the following utilities should be installed:

1. Docker 
- setup Docker's apt repository:
```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

- Install the Docker packages.
```bash
 sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

2. docker-compose
```bash
sudo apt-get install docker-compose
```

## Setup:

To run the project, the following commands should run inside `milestone2` folder:

```
make start
```
The above command is used to start the services. The start of the services take around 10 minutes, as the data should be indexed in the database. Moreover, the data from [here](https://drive.google.com/drive/folders/1zd5pfRjVlyb2tbWu4nTnZTwUkrU_ITZN?usp=drive_link) should be placed in the [data folder](https://github.com/com-480-data-visualization/OutOfTouch/tree/master/data) (```/data```).

```
make stop
```
The above command is used to stop the services.

To be sure that the website started and the database contains everything. Please search a similar log:
```
NETWORK  [conn1] received client metadata from 172.18.0.3:60712 conn1: { driver: { name: "PyMongo", version: "4.1.1" }, os: { type: "Linux", name: "Linux", architecture: "x86_64", version: "6.5.0-27-generic" }, platform: "CPython 3.6.15.final.0" }
```

The website is accessible at the following address: [http://localhost](http://localhost)

In case of problems with the docker configuration, please contact us for a live demo.
