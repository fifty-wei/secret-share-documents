# Secret Sharing Document - Contract

Smart contract for sharing confidential documents on Secret Network.
This contract is design to be use through Secret As A Service. 

## Prerequisites

Before starting, make sure you have [rustup](https://rustup.rs/) along with a
recent `rustc` and `cargo` version installed. Currently, we are testing on 1.41+.

And you need to have the `wasm32-unknown-unknown` target installed as well.

You can check that via:

```sh
rustc --version
cargo --version
rustup target list --installed
# if wasm32 is not listed above, run this
rustup target add wasm32-unknown-unknown
```

## Compiling and running tests

```sh
make build

make test
```

To auto-generate json schema, use 
```sh
make schema
```

# Requests 

## Instanciate message

Allows to initialize the contract. This message has no parameter.

During the initialization, we are generating in the smart contract a public/private key, allowing future private communication through Secret As A Service. 

As a reminder, execute transactions are not passed directly on secret network, but first on an EVM chain, as Polygon, and then, through Axelar GMP passed to Secret Network. On an EVM chain, the transaction needs to be encrypted as the content will be passed in clear. This is the reason why we need to have a public/private key in the contract, that allow us to create a shared secret between a user and the smart contract. 

## Execute message

Our smart contract expects to receive an EVM message. 

To communicate, we have encapsulated sevral layers which composed the final user message. Each layer is responsible of a specific component. As an overview, we will have: 

EVM Message > Encrypted Message > Permit Message > Execute Message

### Receive Message EVM

The smart contract expects to receive a `ReceiveMessageEvm`, which is the message sent by Axelar GMP.

As an example:

```json
"receive_message_evm": {
    "source_chain": "polygon",
    "source_address": "0x329CdCBBD82c934fe32322b423bD8fBd30b4EEB6",
    "payload": EncryptedExecuteMsg, 
}
```

### Encrypted Execute Message

The `EncryptedExecuteMsg` is a structure allowing users to share confidential message to the smart contract. 
We expect the user to generate a public/private key locally, and use the public key of the smart contract to generate a shared secret. Then, using this shared secret to encrypt an `ExecutePermitMsg` that will be the `payload` of this message and share also the public key generated locally in `public_key` allowing the smart contract to know the shared secret based on the user public key and the smart contract private key.

We expect `Vec<u8>` for the two parameters.

```json
{
    "payload": [...],
    "public_key": [...]
}
```

### Execute Permit Message

Once the message decrypted, we will expect to have an `ExecutePermitMsg`. We will expect to have a `permit`, allowing us to prove that the sender is the owner of the given account, and a message to execute.

Note: we need a permit to prove the user as all the messages will be executed by Axelar GMP. In this way, the message is signed by Axelar and not the user. Without a permit, we cannot know which user has sent us a message.

```json
"execute_permit_msg": {
    "with_permit": {
        "permit": Permit,
        "execute": ExecuteMsgAction,
    },
}
```

### Execute Message Action

After all the previous encapsulated layer, it is now the final one, the type of action the user want to execute.

#### Store a new file Action

Store a new file. We expect to only have the content of it. The content can take any form as we expect a string.
So, you can create a json with multiple information and store it directly.

Notice: for larger data, as a file, you can use our SDK that will encrypt your file and store it in IPFS, then store in this smart contract the link of the file on IPFS and the key to decrypt it.

```json
"store_new_file": {
    "payload": "{\"file\": \"content\"}"
}
```

#### Manage file rights Action

Only the owner of the file can call this function for the given file id.

This message allow us to allow users to view the file (`add_viewing`) or revoke the viewing access to some user (`delete_viewing`). For those parameters, we expect a list of addresses.
We also provide a way to change the owner of this file (`change_owner`), which expect an address.

Notice: if we do not want to change the owner, we still need to provide the current owner of the file.

```json
"manage_file_rights": {
    "file_id": "4cbbd8ca5215b8d161aec181a74b694f4e24b001d5b081dc0030ed797a8973e0",
    "add_viewing": ["secret1ncgrta0phcl5t4707sg0qkn0cd8agr95nytfpy"],
    "delete_viewing": ["secret18mdrja40gfuftt5yx6tgj0fn5lurplezyp894y"],
    "change_owner": "secret1ncgrta0phcl5t4707sg0qkn0cd8agr95nytfpy",
}
```


## Query messages

Here the query message of the contract.

### Get Contract Key Query

Get the public key of the contract, allowing future encrypted communication with the smart contract by creating a share secret using this public key.

```json
{
    "get_contract_key": {}
}
```

Response:

```json
{
    "public_key": [...]
}
```


### With Permit Query

For some requests, we expect the user to prove that he is the owner of his address. Permits allow us to do this verification.

```json
{
    "with_permit": {
        "permit": Permit,
        "query" QueryWithPermit
    }
}
```

### Query With Permit

Once the user has proved that he owns his secret address, we can have multiple queries.

#### Get file ids Query

Given a user, retrieve the identifiers of the files to which the user has access.

Example message:

```json
{
    "get_file_ids": {}
}
```


Example response:

```json
{
    "file_ids": [..]
}
```


#### Get File Content Query

Retrieve the contents of the given file id. The requesting user must have view rights to access it. 

Example message:

```json
{
    "get_file_content": {
        "file_id": "id_of_file"
    }
}
```


Example response:

```json
{
    "payload": "{\"file\": \"content\"}"
}
```

#### Get File Access Query

Retrieve the rights of the given file id. Only the owner of the file can see it.

```json
{
    "get_file_access": {
        "file_id": "id_of_file"
    }
}
```


Example response:

```json
{
    "owner": "secret1ncgrta0phcl5t4707sg0qkn0cd8agr95nytfpy",
    "viewers": ["secret1ncgrta0phcl5t4707sg0qkn0cd8agr95nytfpy", ...]
}
```
