!#/bin/bash

openssl req -new -newkey rsa:4096 -nodes \
	-keyout ./ssl/access.private -out ./ssl/access.csr
