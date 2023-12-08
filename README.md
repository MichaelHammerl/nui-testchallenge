# NUI-Testchallenge

This is my proposed solution to the NUI-Testchallenge

## Decisions

- NestJS was chosen as a framework because of personal experience
- Two separate endpoints are provided in order to have uniform responsibilites & response shapes per endpoint
- The service uses a direct connection to Firebase
- As there was no obvious way to me on how to filter in Firebase on a database level, the Querying is done in the code.
- In order to save unnecessary database queries, the whole set of questions & topics is loaded only on application startup.

## Possible Optimizations (given more time)

- To include future changes on the data into the application without restarting the app, listeners could be introduced to update the data inside the application
- Validation & Typing: Due to time constraints, very little capacity was available to validate incoming values. Request parameters as well as data coming from the database should be validated more thoroughly before using them  
- The incoming GET parameters should be validated (syntactically & semantically). A validation pipe might be suitable for this. Generally, there is almost no proper error handling implemented so far.
- The tokenization and application of the ruleset is pretty messy. It would probably make sense to have a lot of tests covering it's integrity, maybe even some monitoring/alerting if an invalid rule is being recognized in the database

### GET /questions/next

This endpoint will provide the next (suitable) question and it's possible answers.
Taking the provided answers into consideration, the rules of possible topics are filtered so that only relevant questions are provided.

There is no special order to look up the questions, although it might make sense to ask certain questions earlier.

If all questions are answered, the response will redirect to the ``/services`` endpoint.
This decision was taken to have a single responsibility & response per endpoint.

### GET /services

Return a list of all viable services for the user, considering their answers.

This would typically be after all questions have been completed. However, it might be nice to have this available even if only a part of the question pool has been answered.

## Installation

```bash
$ npm install
```

## Prerequisites
To establish a connection to Firebase some environment variables need to be set, e.g. via ``.env`` file.
See ``.env.example`` on what needs to be set. The real values can be obtained in the firebase console inside the service accounts settings.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### OpenAPI

The basic version of the OpenAPI Client can be reached via

```http://localhost:3000/api```

Due to time constraints, only a basic setup has been implemented.

## Test

Due to time constraints, only a few unit tests have been implemented for the QuestionRepository. 

Given the dynamic ruleset and thus missing type safety, a high test coverage including different edge cases would be the goal.

```bash
# unit tests
$ npm run test

```
