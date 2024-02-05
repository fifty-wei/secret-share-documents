#!make
include .env

# -------------- DEPLOYMENT -------------- #

deploy: 
	npx hardhat deploy --network $(NETWORK)

deploy-verify: 
	npx hardhat deploy --verify --network $(NETWORK)

#-------------- PLAYGROUND ----------------#

set-data:
	npx hardhat run scripts/playground/setData.ts --network $(NETWORK)

#-------------- SETUP ----------------#

setup: deploy set-data

#-------------- SUBGRAPH ----------------#

update-subgraph-config: update-subgraph-abis update-subgraph-addresses

ifeq ($(OS),Windows_NT)
update-subgraph-abis:
	Get-ChildItem -Path 'artifacts\contracts\' -Recurse -Include *.json | Where-Object { $_.FullName -notmatch '\\interfaces\\' -and $_.Name -notmatch '.*\.dbg\.json' } | Copy-Item -Destination '$(SUBGRAPH_FOLDER)\abis\' -Force
else
update-subgraph-abis:
	find artifacts/contracts -path "artifacts/contracts/interfaces" -prune -o -name "*.json" ! -name "*.dbg.json" -exec cp {} $(SUBGRAPH_FOLDER)/abis/ \;
endif

update-subgraph-addresses: 
	npx hardhat run scripts/utils/setSubgraphAddresses.ts --network $(NETWORK)