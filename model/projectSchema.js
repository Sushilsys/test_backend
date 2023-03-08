const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  project_name: { type: String, default: null },
  project_manager: { type: String, default: null },
  project_developer: { type: String, default: null },
  project_status: { type: String, default: null},
  project_task_name: { type: String,default: null },
});

module.exports = mongoose.model("project", projectSchema)