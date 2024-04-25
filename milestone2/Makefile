all: start

start:
	sudo docker-compose up --force-recreate

deploy: start
	xdg-open http://localhost:3000

stop:
	sudo docker-compose down --remove-orphans

clean: stop
	sudo docker volume rm $$(sudo docker volume ls | awk '{print $$2}' | tail -n +2)

build:
	sudo docker-compose build --no-cache
	sudo docker-compose up