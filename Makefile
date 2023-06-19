build:
	docker build -t trnsbot .
run:
	docker run -d -p 3000:3000 -v /root/translator_bot/src/database:/app/src/database --restart unless-stopped --name trnsbot trnsbot
home-run:
	docker run -d -p 3000:3000 -v C:/TranslatorBOT/src/database:/app/src/database --restart unless-stopped --name trnsbot trnsbot
stop:
	docker stop trnsbot
update:
	docker stop trnsbot
	docker rm trnsbot
	docker rmi trnsbot
	docker build -t trnsbot .
del:
	docker stop trnsbot
	docker rm trnsbot