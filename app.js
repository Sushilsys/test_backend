require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require('bcrypt');

const app = express();
 jwt = require('jsonwebtoken');

app.use(express.json());


const User = require("./model/user");

const Project = require("./model/projectSchema");

app.post("/register", async (req, res) => {

    // Our register logic starts here
     try {
      // Get user input
      const { firstName, lastName, email, password, roles } = req.body;
  
      // Validate user input
      if (!(email && password && firstName && lastName && roles)) {
        res.status(400).send("All input is required");
      }
  
      // check if user already exist
      // Validate if user exist in our database
      const oldUser = await User.findOne({ email });
  
      if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }
  
      //Encrypt user password
      encryptedUserPassword = await bcrypt.hash(password, 10);
  
      // Create user in our database
      const user = await User.create({
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(), // sanitize
        password: encryptedUserPassword,
        roles:roles
      });
  
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "12h",
        }
      );
      // save user token
      user.token = token;
  
      // return new user
      res.status(200).json(user);
    } catch (err) {
      console.log(err);
    }
   
  });
  
 // user login method
  app.post("/login", async (req, res) => {

    const { email, password } = req.body;

    if (!(email && password)) {
        res.status(400).send("All input is required");
      }

      const user = await User.findOne({ email });
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "12h",
          }
        );
  
        // save user token
        user.token = token;
  
        // user
        return res.status(200).json(user);
      }

      return res.status(400).send("Invalid Credentials");
  });




  app.post("/projectDetails", async (req, res) => {

    // Our register logic starts here
     try {
      // Get project input
      const { projectName, projectManager, projectDeveloper} = req.body;
  
      // Validate user input
      if (!(projectName && projectManager && projectDeveloper)) {
        res.status(400).send("All input is required");
      }
     
      const isAdmin = await User.findOne({ "roles":"admin" });
      if (!isAdmin) {
        return res.status(403).send("User not admin. Please Login as admin");
      }

      // Create project in our database
      const ProjectDetails = await Project.create({
        project_name: projectName,
        project_manager:projectManager,
        project_developer:projectDeveloper,
      });
  
      res.status(200).json(ProjectDetails);
    } catch (err) {
      console.log(err);
    }
  
  });
  

// create a task here
  app.post("/taskDetails", async (req, res) => {
     try {

      // Get user input
      const projectStatus = ["TODO","IN-PROGRESS","DONE"]
  
      const {projectTaskName} = req.body;
  
      // Validate user input
      if (!(projectTaskName)) {
        res.status(400).send("All input is required");
      }
     
      const oldUser = await User.findOne({ "roles":"manager" });
      if (!oldUser) {
        return res.status(403).send("User not manager. Please Login as manager");
      }

      const projectView = await Project.findOne({})
  
      // console.log(projectView)
      // Create user in our database
      const ProjectDetail = await Project.create({
        project_name: projectView.project_name,
        project_status:"TO_DO",
        project_manager:projectView.project_manager,
        project_task_name:projectTaskName,
        project_developer:projectView.project_developer
      });
      console.log(ProjectDetail)
      res.status(201).json(ProjectDetail);
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });
  
  app.post("/taskDetails", async (req, res) => {

    // Our register logic starts here
     try {
      // Get user input

      const projectStatus = ["TODO","IN-PROGRESS","DONE"]
  
      const {projectTaskName} = req.body;
  
      // Validate user input
      if (!(projectStatus)) {
        res.status(400).send("All input is required");
      }
     
      const oldUser = await User.findOne({ "roles":"Developer" });
      if (!oldUser) {
        return res.status(40).send("User not Developer. Please Login as Developer");
      }

      const projectView = await Project.findOne({})
  
      // Create projectTask in our database
      const ProjectDetail = await Project.create({
        project_name: projectView.project_name,
        project_status:"TO_DO",
        project_manager:projectView.project_manager,
        project_task_name:projectTaskName,
        project_developer:projectView.project_developer
      });
      console.log(ProjectDetail)
      res.status(200).json(ProjectDetail);
    } catch (err) {
      console.log(err);
    }
  });
  
  //  for status updates
  app.put("/taskStatus/:developer", async (req, res) => {

   
     try {

      // Get user input for status updates
      const {projectStatus} = req.body;

      var developerName = req.body.name;
      const Id = req.params.id;
  
      // Validate user role
      if (!(developerName)) {
        res.status(400).send("All input is required");
      }
     
      const isDeveloper = await User.findOne({ "roles":"Developer" });
      if (!isDeveloper) {
        return res.status(403).send("User not Developer. Please Login as Developer");
      }

      const projectTaskView = await Project.findById( Id, function(err, p) {
        if (!p)
          return next(new Error('Could not load Document'));
        else {
          //  status updates here
          project_status = projectStatus
          p.save(function(err) {
            if (err)
              console.log('error')
            else
              console.log('success')
          });
        }
      });

      res.status(200).json(projectTaskView);
    } catch (err) {
      console.log(err);
    }
  });
  
 // get all taks list here
  app.get("/taskList", async (req, res) => {

     try {
  
      const isAdmin = await User.findOne({ "roles":"admin" });
      if (!isAdmin) {
        return res.status(403).send("User not manager. Please Login as manager");
      }
      const projectTaskList = await Project.find({})
      res.status(200).json(projectTaskList);
    } catch (err) {
      console.log(err);
    }
  });
  
  // get list for in-progress
  app.get("/taskInProgress", async (req, res) => {
     try {

      const progressTaskList = await Project.find({"project_status":"IN-PROGRESS"})

      res.status(200).json(progressTaskList);
    } catch (err) {
      console.log(err);
    }
  
  });


    // get list for todo
    app.get("/taskInProgress", async (req, res) => {
      try {
 
       const todoTaskList = await Project.find({"project_status":"TODO"})
 
       res.status(200).json(todoTaskList);
     } catch (err) {
       console.log(err);
     }
   
   });
 

   // get list for done
  app.get("/taskInDone", async (req, res) => {

     try {
  
        const doneTaskList = await Project.find({"project_status":"DONE"})

      res.status(200).json(doneTaskList);
    } catch (err) {
      console.log(err);
    }
  });
  
  // get count for done task
  app.get("/dontask", async (req, res) => {
     try {
  
      const isAdmin = await User.findOne({ "roles":"admin" });
      if (!isAdmin) {
        return res.status(403).send("User not admin. Please admin as manager");
      }
      const doneTaskList = await Project.count({"project_status":"DONE"})

      res.status(200).json(doneTaskList);
    } catch (err) {
      console.log(err);
    }
  });




module.exports = app;