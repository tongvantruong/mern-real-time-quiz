# mern-real-time-quiz

## Architecture Diagram

<img width="988" alt="Screenshot 2024-12-16 at 09 27 32" src="https://github.com/user-attachments/assets/26be0805-c1ec-480b-984b-97862180dd77" />

### FRONTEND

Presentation layer, responsible for creating User Interface. Fronend will communicate with backend via RES API to retrieve and save quiz, score, leaderboard data.

We should have 2 screens like below
<img width="785" alt="Screenshot 2024-12-16 at 09 51 30" src="https://github.com/user-attachments/assets/d5423f6c-c05d-4a02-9abf-75f01fd6f097" />

**Techstack**

I was considering betwee the 3 frontend frameworks/librarys that I have experience: ReactJS, VueJS or Flutter. Then I chose the most famous one which is ReactJS so we can go with MERN techstacks

### BACKEND

Middle or application layer, esponsible for creating REST API, calculating the logic then send it back to frontend as well as store the data to database. Backend can communicate with database by using [mongoose](https://mongoosejs.com/)

I will use NodeJS as a web server, ExpressJS as a web framework so we can easy create routing API. Our sytem needs to communicate in real time so Socket.io should be the best choice.

### DATABASE

Database layer, responsible for storing our data.
I will go with MongoDB as a non-SQL, cross flatform and document-oriented database which is easy to scale, high performance for a real time app.

**So in this project, we will take advantages of the MERN techstacks: MongoDB, ExpressJS, ReactJS, NodeJS**

