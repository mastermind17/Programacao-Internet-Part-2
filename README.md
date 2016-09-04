# Football & Node.JS - Part 2

## Problem being solved

This time the application tries to solve the same problem as in [part 1](https://github.com/CaptainGabriel/Football_and_Node.js-Part_1) only instead this time we will use [Express.js](expressjs.com) in order to build a more robust web application. [Handlebars](handlebarsjs.com) will be our view engine.

Another difference from the first part is the usage of persistent storage. This second part will let the user create a group of teams and save it inside the database.

Having Express.js this time will let us separate responsabilities in a more robust way making very clear what the server application can handle, what expects from clients that try to communicate with it and what will serve as response.  

Made once again with the contribution of Pedro Gabriel.

## How did we solved it

Usually is a good idea to separate web application into smaller parts. Some are responsable for creating/retrieving data, some tend to deal with different ways of showing that same data, etc etc. This led us into using what it is called the MVC Pattern. The framework itself agrees with this idea. The following diagram tries to show what was done in order to separate responsabilities of the various parts of our app.

![diagram](http://i.imgur.com/lVO89Jr.png)

The persistent storage of information is implemented using CouchDB and the communication between the server and the storage was implemented with a pattern made famous by Martin Fowler, [Data Mapper](http://martinfowler.com/eaaCatalog/dataMapper.html).

> A layer of Mappers that moves data between objects and a database while keeping them independent of each other and the mapper itself.

The mapper is implemented by the module _group_mapper.js_. The application lets the user create a group of teams. The mapper tries to implement the "translation" between the data used inside the server application and the data being stored inside the DB.

Working with CouchDB was very funny because every action can relate to an HTTP method. If you want to retrieve a record you can just make a GET request. If you want to insert some data you just need to make a POST request and so on and so forth.

Controllers are the handlers of each route. Since we are programming in javascript, they map into functions. Routes are defined inside the package _"routes"_. Once the data is obtained by the controllers they just need to render a certain view and passing that same information as context to the view. Handlebars will let us design the flow in order to present the data as we wish. We can now show data as we see fit according to some restrictions much more easilly when compared with the first part of the project. This is the great advantage of using view engines. 

## How to use

`npm install`

`npm start`