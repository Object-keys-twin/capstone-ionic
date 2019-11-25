# Notes on Code Review 1

## Schema

Just because NoSQL is "schemaless" does not mean you can freebird how you store your data. Really think about how your data will be organized in an efficient way. You still need to structure your data but within the confines of a different paradigm.

### Schema: Things to think about

- Many collections vs. Smaller Documents
- Relational (SQL) vs. Nonrelational (NoSQL) (Note: There are many flavors of NoSQL DBs. In the case of Firestore, it's a document store)
    - What kind of data would be appropriate for each?
    - What does SQL offer over NoSQL?
    - What does NoSQL offer over SQL?

## Ionic

Really think about what Ionic "is"? What does it help us solve? What does React Native do vs. Ionic?

### Ionic: Things to think about

- What is a hybrid application?
- How does Ionic achieve cross mobile applications? Look into React Native, specifically called the "JavaScript Bridge" and see if you can find the equivalent of how Ionic achives this. Or are they the same?

## Project Management

- Explicit wording
- Semantic project board
- Getting on the same page
- Wiki

Examples:
- [Grace Shopper Example Wiki](https://github.com/rushilshakya/GraceShopper/wiki)
- [Capstone Example Project Board](https://github.com/fullstack-yogis/postAR/projects/1)