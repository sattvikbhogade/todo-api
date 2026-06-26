const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

const path = require('path')

//express app
const app = express()
app.use(express.json())

//database path
const dbPath = path.join(__dirname, "todoApplication.db")

//open database
let db = null

const initializeDBAndServer = async () => {
  try {
    //connects nodejs with sqlite
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    //create table
    await db.exec(`
            CREATE TABLE IF NOT EXISTS todo(
                id INTEGER,
                todo TEXT,
                priority TEXT,
                status TEXT
            )
        `)

        app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(e.message)
  }
}

initializeDBAndServer()

//API_1(Returns a list of all todos whose status is 'TO DO')
app.get('/todos/', async (request, response) => {
  const {status, priority, search_q = ''} = request.query

  let query = ''

  if (status && priority) {
    query = `
            SELECT *
            FROM todo 
            WHERE status = '${status}'
            AND priority = '${priority}';
        `
  } else if (status) {
    query = `
            SELECT *
            FROM todo
            WHERE status='${status}';
        `
  } else if (priority) {
    query = `
            SELECT *
            FROM todo
            WHERE priority='${priority}';
        `
  } else {
    query = `
            SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%';
        `
  }

  const data = await db.all(query)
  response.send(data)
})


//API_2(Returns a specific todo based on the todo ID)
app.get("/todos/:todoId/", async (request, response) => {
    const {todoId} = request.params;

    const getTodoQuery = `
        SELECT * 
        FROM todo 
        WHERE id = ${todoId};
    `;

    const todo = await db.get(getTodoQuery);
    response.send(todo);
})


//API_3(Create a todo in the todo table)
app.post("/todos/", async (request, response) => {
    const{ id, todo, prioity, status } = request.body;

    const addTodoQuery = `
        INSERT INTO todo (id, todo, priority, status)
        VALUES(
            ${id},
            '${todo}',
            '${prioity}',
            '${status}'
        );
    `;

    await db.run((addTodoQuery));

    response.send("Todo Successfully Added")
})


//API_4(Updates the details of a specific todo based on the todo ID)
app.put("/todos/:todoId/", async (request, response) => {
    const { todoId } = request.params;
    const {status, priority, todo} = request.body;

    if (status !== undefined) {
        const updateStatusQuery = `
            UPDATE todo 
            SET status = '${status}'
            WHERE id = ${todoId};
        `;

        await db.run(updateStatusQuery);
        response.send("Status Updated");
    }

    else if(priority !== undefined) {
        const updateStatusQuery = `
            UPDATE todo 
            SET priority = '${priority}'
            WHERE id = ${todoId};
        `;

        await db.run(updateStatusQuery);
        response.send("Priority Updated");
    }

    else if(priority !== undefined) {
        const updateStatusQuery = `
            UPDATE todo 
            SET todo = '${todo}'
            WHERE id = ${todoId};
        `;

        await db.run(updateStatusQuery);
        response.send("Todo Updated");
    }

})

// API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const {todoId} = request.params;

  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id=${todoId};
  `;

  await db.run(deleteTodoQuery);

  response.send("Todo Deleted");
});

module.exports = app;
