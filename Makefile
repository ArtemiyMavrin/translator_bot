build:
	docker build -t trnsbot .
run:
	docker run -d -p 3000:3000 --restart unless-stopped trnsbot