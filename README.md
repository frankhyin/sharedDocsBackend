# sharedDocsBackend
Before you do anything, do npm install on the project.

To start your testing environment, create an env.sh. It should require three things: 

1). Create a MLab database. Create a user and put that in the URI from MLab. 
It should look something like this:
```export MONGODB_URI="mongodb://username:password@******.mlab.com:******/dfm"```

2.) Create a salt for cryptography. It can be any string.
It should look something like this: 
```export SALT="ANYTHING"```

3.) Create a JSON Web Token secret. Again, it can be any string. 
It should look something like this:
```export JWT_SECRET="somestring"```

Now that you have your env.sh created, source env.sh before you run the program.
If successful, your terminal should say:
```Server listening on port 3000.```

After you have the backend running, you should proceed to set up the [front end](https://github.com/frankhyin/sharedDocs). 
