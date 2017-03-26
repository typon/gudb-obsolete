.PHONY:
	@echo "To launch program, please do make run"
ts:
	tsc -p tsconfig.json

install:
	cd build
	npm install

