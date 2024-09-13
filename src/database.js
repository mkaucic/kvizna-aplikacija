const knex = require("knex");
const path = require("path");

const db = knex({
  client: "sqlite3",
  connection: {
    filename: path.join(__dirname, "..", "quiz.sqlite"),
  },
  useNullAsDefault: true,
});

// Ensure the questions table exists
db.schema.hasTable("questions").then((exists) => {
  if (!exists) {
    return db.schema.createTable("questions", (table) => {
      table.increments("id").primary();
      table.string("question").notNullable();
      table.string("answer").notNullable();
    });
  }
});

module.exports = db;
