const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const hasStatusAndPriority = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};
const hasCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const hasCategoryAndPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const checkValidValues = async (request, response, next) => {
  const priorityList = ["HIGH", "MEDIUM", "LOW"];
  const statusList = ["TO DO", "IN PROGRESS", "DONE"];
  const categoryList = ["WORK", "HOME", "LEARNING"];

  const { status, priority, category, date } = request.query;
  const due_date = new Date(date);
  //   try {
  //     if (isValid(due_date)) {
  //       const newDate = format(due_date, "yyyy-MM-dd");
  //       console.log(newDate);
  //     } else {
  //       console.log("Invalid Due Date");
  //       response.status(400);
  //       response.send("Invalid Due Date");
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }

  if (status !== undefined && !statusList.includes(status)) {
    response.status(400);
    response.send("Invalid Todo Status");
  }
  if (priority !== undefined && !priorityList.includes(priority)) {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
  if (category !== undefined && !categoryList.includes(category)) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else {
    next();
  }
};

// API 1
app.get("/todos/", checkValidValues, async (request, response) => {
  const requestObject = request.query;
  const { search_q = "", priority, status, category } = requestObject;
  let getTodoQuery;
  const { dueDate } = request;
  console.log(dueDate);
  switch (true) {
    case hasStatusAndPriority(requestObject):
      getTodoQuery = `SELECT * FROM todo 
                WHERE status = '${status}' AND priority = '${priority}';`;
      break;
    case hasCategoryAndStatus(requestObject):
      getTodoQuery = `SELECT * FROM todo 
                WHERE status = '${status}' AND category = '${category}';`;
      break;
    case hasCategoryAndPriority(requestObject):
      getTodoQuery = `SELECT * FROM todo 
                WHERE priority = '${priority}' AND category = '${category}';`;
      break;
    case hasStatus(requestObject):
      getTodoQuery = `SELECT * FROM todo 
                WHERE status = '${status}';`;
      break;
    case hasPriority(requestObject):
      getTodoQuery = `SELECT * FROM todo 
                WHERE priority = '${priority}';`;
      break;
    case hasCategory(requestObject):
      getTodoQuery = `SELECT * FROM todo 
                WHERE category = '${category}';`;
      break;
    default:
      getTodoQuery = `SELECT * FROM todo 
                WHERE todo LIKE '%${search_q}%';`;
      break;
  }
  const data = await db.all(getTodoQuery);

  response.send(data);
});
