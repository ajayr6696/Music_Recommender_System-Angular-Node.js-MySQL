# Music_Recommender_System-Angular-Node.js-MySQL
A simple Music Recommender System developed using Angular, Node.js and MySQL and Recommendations logics are explored, using different filter techniques


## Technologies Used

- Node.js v14.15.3 ([Download](https://nodejs.org/en/))
- NPM v6.14.9
- MySQL v5.7+
- Angular CLI v11.0.5 ([Angular CLI Installation](https://angular.io/cli))

### External Libraries

#### Angular Application Libraries (Frontend)

- @ng-bootstrap (Latest)
- Bootstrap (Latest)
- JQuery (Latest)
- Ngx-Spinner (Latest)

#### Node.js Application Libraries (Backend)

- Knex (Latest) ([Knex Package](https://www.npmjs.com/package/knex))
- MySQL (Latest) ([MySQL Package](https://www.npmjs.com/package/mysql))
- Natural (Latest) ([Natural Package](https://www.npmjs.com/package/natural))
- Stopword (Latest) ([Stopword Package](https://www.npmjs.com/package/stopwords))
- Striptags (Latest) ([Striptags Package](https://www.npmjs.com/package/striptags))
- Vector-Object (Latest) ([Vector-Object Package](https://www.npmjs.com/package/vector-object))

## Instructions to Run the Application

### Setting up the Database

#### Users Table

- Name: users
- Purpose: To store user details and filter results of users

#### Songs Table

- Name: songs
- Purpose: To store song details and similar content of songs

#### Liked Table

- Name: liked
- Purpose: To store liked songs of users

Download and run the provided SQL files to fill the tables in the selected database. Update database connection details in `backend/config.js`.

Example:
```javascript
DB_NAME: "music_recommender",
DB_HOST: "project.cqvbqklh6tez.ap-south-1.rds.amazonaws.com",
DB_USER: "admin",
DB_PASSWORD: "admin123"
```
### Running Backend

1. Navigate to the backend project folder and execute the following command to install dependencies:
```
npm install
```
2. Start the Node.js server using the following command:
```
npm start
```
3. Once you see "Listening on port 3001," the application is running on port 3001.

4. To stop the server, press `Ctrl + C`.

## Running Frontend

1. Install Angular CLI from [Angular CLI Installation](#).

2. Navigate to the frontend project folder and execute the following command to install dependencies:
```
npm install
```
3. Start the Angular Application using the command:
```
ng serve
```
4. Once you see "Compiles successfully," the application is running on port 4200.

## Component-wise Description

### Helpers Folder

Contains reusable code snippets, including functions for data training and response formatting.

### Controllers

Main functions where the request and response cycle (ExpressJS) ends.

### Repositories

Holds Knex queries, a query helper wrapped around MySQL.

### Routes

Contains all the routes of the Express.js server.

### App.js

Imports every single component to make it available as an API. Also contains server management.

### Content-Based Recommendation (backend/helpers/trainer.js)

- `train()`: Calls various functions for content-based recommendation.
- `validateDocuments()`: Validates and preprocesses input documents.
- `preprocessDocuments()`: Completes document preprocessing, including tokenization.
- `produceWordVectors()`: Generates word vectors using tf-idf algorithm.
- `calculateSimilarities()`: Calculates document similarities for recommendations.

Uncomment line 11 in `backend/controllers/contentRecommender.js` to run the content-based trainer function.

### Collaborative Recommendation (backend/helpers/cftrainer.js)

- `trainDataForAllUsers()`: Trains collaborative recommendation data for all users.
- `fetchUserList()`, `fetchSongList()`, `fetchLikeList()`: Fetches necessary data.
- `createCoMatrix()`: Creates co-occurrence matrix.
- `getRecommendations()`: Calculates recommendations using co-occurrence matrix.

Uncomment line 12 in `backend/controllers/contentRecommender.js` to run the collaborative trainer function.

To run the collaborative filter for the current user, uncomment line 101 in `backend/controllers/contentRecommender.js`.
