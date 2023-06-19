build:
	docker build -t trnsbot .
run:
	docker run -d -p 3000:3000 -v /translator_bot/src/database:/app/src/database --restart unless-stopped --name trnsbot trnsbot
home-run:
	docker run -d -p 3000:3000 -v /TranslatorBOT/src/database:/app/src/database --restart unless-stopped --name trnsbot trnsbot
stop:
	docker stop trnsbot