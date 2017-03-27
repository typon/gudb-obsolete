PHONY:
	@echo "Please do make ts to build the .js, then run make install to build js packages"
ts:
	tsc -p tsconfig.json

install:
	cd build
	npm install

