require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.uqp2cfn.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("pawmart");
    const listingsCollection = db.collection("listings");
    const ordersCollection = db.collection("orders");

    // get recent listing
    app.get("/recent-listings", async (req, res) => {
      const result = await listingsCollection
        .find()
        .sort({ _id: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // get by category
    app.get("/category-filtered-product/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category: category };
      const result = await listingsCollection.find(query).toArray();
      res.send(result);
    });

    // get all listing
    app.get("/all-listings", async (req, res) => {
      const result = await listingsCollection.find().toArray();
      res.send(result);
    });

    // get single listing
    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const query = { _id: new ObjectId(id) };
        const result = await listingsCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.status(400).send({ message: "Invalid ID format" });
      }
    });
    console.log("Connected to MongoDB");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("PawMart Server is working");
});

app.listen(port, () => {
  console.log(`Server on port ${port}`);
});
