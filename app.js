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
