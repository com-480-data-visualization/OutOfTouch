all: start

start:
	sudo docker-compose up --build

stop:
	sudo docker-compose down

#clean: stop
#	sudo docker volume rm $(sudo docker volume ls | awk '{print $2}' | tail -n +2)
