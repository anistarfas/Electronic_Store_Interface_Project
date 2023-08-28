Author: Anis Tarfas

Purpose: Develop a code capable of using a database to store user profile and order information. Additionally, use session support to the application so that users may log in, 
place orders, and view a history of their orders. 

Design: Using XMLHttpRequest to retrive information which then we can use when the server recvied the information get and post request are created to 
add or updated the information based on the users needs. and Using Express module to help provide simplicity when dealing with the requests and using mongo and mongoos 
to add and update and find data that we need. also using forms for requests

How To Run: Make sure that your directory or location is in the assigment folder containg all the files then in the terminal write 
npm install  after the install  procces, you will have to start the mongo database by running in a terminal brew services start mongodb-community@5.0 after you get confirmation that mongo has started 
you can run the database by entering in the terminal node database-intializer.js then you can run the server by entering in the terminal node server.js after you get confirmation that the server in running 
open chrome and enter http://localhost:3000/