require("dotenv").config();
const express = require("express");
const cors = require("cors");

//importing all route handlers
const users = require("./routes/users.js");
const decodeToken = require("./routes/decodeToken.js");
const reportSpamSignup = require("./routes/reportSpamSignup.js");
const verifyEmail = require("./routes/verifyEmail.js");
const handleSearchForProposals = require("./routes/handleSearchForProposals.js");
const handleSearchForProjects = require("./routes/handleSearchForProjects.js");
const proposals = require("./routes/proposals.js");
const projects = require("./routes/projects.js");
const freelacerProfilePicUploadHandler = require("./routes/imageUploadHandlers/freelancerProfilePicUploadHandler.js");
const clientProfilePicUploadHandler = require("./routes/imageUploadHandlers/clientProfilePicUploadHandler");
const proposalImageUploadHandler = require("./routes/imageUploadHandlers/proposalImagesUploadHandler.js");
const topLevelCategoriesHandler = require("./routes/allCategoriesHandlers/topLevelCatgoriesHandler.js");
const midLevelCategoriesHandler = require("./routes/allCategoriesHandlers/midLevelCatgoriesHandler.js");
const bottomLevelCategoriesHandler = require("./routes/allCategoriesHandlers/bottomLevelCatgoriesHandler.js");
const removeOfflinePeopleFromOnlineUsersTable = require("./src/modules/cronJobs.js");
const chatContactsHandler = require("./routes/chat/chatContacts.js");
const chatMessagesHandler = require("./routes/chat/chatMessagesHandler.js");
const attachmentUploadHandler = require("./routes/projectAttachmentUploadHandlers/attachmentUploadHandler.js");

const app = express();

app.use("/public", express.static("public"));
app.use(express.json());
app.use(cors());
const corsOptions = { exposedHeaders: "x-auth-token" };
app.use(cors(corsOptions));

//assigning route handlers to the routes
app.use("/api/users", users); //handles user sign up and login
app.use("/api/report-spam-signup", reportSpamSignup);
app.use("/api/authenticate", decodeToken);
app.use("/api/verify/email", verifyEmail);
app.use("/api/search/proposals", handleSearchForProposals);
app.use("/api/search/projects", handleSearchForProjects);
app.use("/api/proposals", proposals);
app.use("/api/projects", projects);

// all categories related
app.use("/api/top-level-categories", topLevelCategoriesHandler);
app.use("/api/mid-level-categories", midLevelCategoriesHandler);
app.use("/api/bottom-level-categories", bottomLevelCategoriesHandler);

// profile picture related
app.use("/api/upload-avatar/freelancer", freelacerProfilePicUploadHandler);
app.use("/api/upload-avatar/client", clientProfilePicUploadHandler);

// chat related
app.use("/api/chat-contacts", chatContactsHandler);
app.use("/api/chat-messages", chatMessagesHandler);

// proposal images related
app.use("/api/uploads/proposalImages", proposalImageUploadHandler);

// projects related
app.use("/api/upload/project-attachments", attachmentUploadHandler);

// this function triggers in every 2 minutes to perform server side routine works
// FIXME: Remove the following cron job function
const interval = 1000 * process.env.CRON_JOBS_INTERVAL;
function runEverySecond() {
  setTimeout(() => {
    removeOfflinePeopleFromOnlineUsersTable();
    runEverySecond();
  }, interval);
}
runEverySecond();

//listening
const portNumberOnLocalHost = process.env.LISTENING_PORT_OF_HHH_BACKEND_SERVER;
app.listen(process.env.PORT || portNumberOnLocalHost, () => {
  console.log(`HHH-backend is runnung on port ${portNumberOnLocalHost}`);
});

//FIXME:
// 1. /routes/users.js
// 2. TODO: create route service-offers
