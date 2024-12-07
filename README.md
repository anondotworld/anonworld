# anonworld

## Setup

Install javascript dependencies using [bun](https://bun.sh/)

```
bun install
```

Install [nargo](https://github.com/noir-lang/nargo) using [noirup](https://github.com/noir-lang/noirup).

Install noirup and update PATH

```
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
```

Install nargo version 0.38.0

```
noirup --version 0.38.0
```

Install the proving backend. Read more about proving backends [here](https://noir-lang.org/docs/getting_started/quick_start#proving-backend).

```
curl -L bbup.dev | bash
bbup
```

Test by building the circuits

```
bun run zk:build
```

Running the app requires the `.env` file to be present in the `anoncast` directory.

Copy the `.env.example` file to `.env` and supply the missing values.

### Run the app

```
bun run anoncast
```

### Run the api

```
bun run api:dev
```
