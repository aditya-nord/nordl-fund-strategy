# Nordl Fund Strategy

## To Run

Update `.env` file with
```
DATABASE_URL=""
PORT = "1337"
NODE_ENV = "development"
```

`yarn prisma migrate dev` followed by `yarn dev` while making any necessary changes to the `src/index.ts` file.
