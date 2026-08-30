/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("test");

// Create a new document in the collection.
db.getCollection("users").insertOne({
    {
  "name": "Test Patient",
  "phoneNumber": "9509409853",
  "dob": "1990-01-01"
}
});
