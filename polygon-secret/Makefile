#!make
include .env

copy-abis:
	@if [ "$(OS)" = "Windows_NT" ]; then \
		cp artifacts/contracts/PolygonToSecret.sol/PolygonToSecret.json ../sdk-js/src/abis/PolygonToSecret.json; \
	else \
		cp artifacts/contracts/PolygonToSecret.sol/PolygonToSecret.json ../sdk-js/src/abis/PolygonToSecret.json; \
	fi


# -------------- DEPLOYMENT -------------- #
deploy:
	npx hardhat deploy --network $(NETWORK)
	$(MAKE) copy-abis

deploy-verify:
	npx hardhat deploy --verify --network $(NETWORK)
	$(MAKE) copy-abis
