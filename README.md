# Welcome

Use this repository to complete tasks below. Each task is a base for the next one. Commit your changes to repository after every task. Provide **documentation** and **unit tests** for as many components as possible.

## Getting started

```sh
npm install
```

To run the `frontend` app run:

```sh
npx nx run frontend:serve
```

To run the `gateway` app (backend) run:

```sh
npx nx run gateway:serve
```

From now on, you are the owner of this repo - you can do whatever you want - including installing new packages, using frameworks of choice, editing packages config `scripts` section etc.

## Tasks 1

Modify landing page in the `frontend` app to display table with Jokes. Create as many components as necessary.

- [ ] User can add Joke to the table by clicking on "Fetch Joke" button.
- [ ] Jokes **MUST** be fetched in English from https://v2.jokeapi.dev API.
- [ ] The table should have columns for category, joke or setup+delivery, and flags.
- [ ] User can filter Jokes by category.
- [ ] Created components should be implemented and styled with framework of choice.
- [ ] The interface must remain functional and constrained to a maximum height of 600px, regardless of the number of jokes added to the list.

## Tasks 2

Modify the `gateway` and `frontend` app to automate Joke delivery by backend.

- [ ] User can toggle automatic Joke delivery by clicking on new "Joke feed" button.
- [ ] Jokes should be fetched by `gateway` app and delivered to `frontend` every 5s.
- [ ] The fetch and delivery of each joke **MUST** be initiated by the `gateway` app.

## Tasks 3

Move away Joke fetching from the `gateway` app to new `emitter` app.

- [ ] The `gateway` app acts as a proxy between `frontend` and the `emitter` app which fetches Jokes.
- [ ] The `gateway` app should not directly 'ask' the `emitter` for a Joke; it should react to what the `emitter` produces.
- [ ] The `emitter` and `gateway` apps should communicate using message broker of choice - preferably RabbitMQ.
  - [ ] Provide `docker run` command or `docker compose` file to run the broker locally.
