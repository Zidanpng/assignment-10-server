require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
app.use(
  cors({
    origin: [
      "https://assignment-10-server-woad-six.vercel.app/",
      "https://assignment-10-server-woad-six.vercel.app",
      "",
      "*",
    ],
    credentials: true,
  }),
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.uqp2cfn.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let listingsCollection, ordersCollection;

async function connectDB() {
  if (!listingsCollection || !ordersCollection) {
    await client.connect();
    const db = client.db("pawmart");
    listingsCollection = db.collection("listings");
    ordersCollection = db.collection("orders");
    console.log("Connected to MongoDB");
  }
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).send({ message: "Database connection failed", error });
  }
});

app.get("/", (req, res) => res.send("PawMart Server is working"));
// get recent listing
app.get("/recent-listings", async (req, res) => {
  try {
    const result = await listingsCollection
      .find()
      .sort({ _id: -1 })
      .limit(6)
      .toArray();
    console.log(`Found${result.length}pets for recent listings`);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Server Error", error });
  }
});

// get by category
app.get("/category-filtered-product/:category", async (req, res) => {
  const category = req.params.category;
  const query = { category: { $regex: new RegExp(`^${category}$`, "i") } };
  const result = await listingsCollection.find(query).toArray();
  res.send(result);
});

// type
app.get("/type-filtered-product/:type", async (req, res) => {
  const type = req.params.type;
  const query = { type: { $regex: new RegExp(`^${type}`, "i") } };
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

// get my orders
app.get("/my-orders/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const result = await ordersCollection.find(query).toArray();
  res.send(result);
});

// get my list
app.get("/my-listings/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email };
  const result = await listingsCollection.find(query).toArray();
  res.send(result);
});

// post
app.post("/orders", async (req, res) => {
  const order = req.body;
  const result = await ordersCollection.insertOne(order);
  res.send(result);
});

//post
app.post("/add-listing", async (req, res) => {
  const listing = req.body;
  const result = await listingsCollection.insertOne(listing);
  res.send(result);
});

//put
app.put("/update-listing/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      location: req.body.location,
      type: req.body.type,
      image: req.body.image,
      description: req.body.description,
    },
  };
  const result = await listingsCollection.updateOne(filter, updateDoc);
  res.send(result);
});

//delete listing
app.delete("/listing/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await listingsCollection.deleteOne(query);
  res.send(result);
});

app.delete("/order/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await ordersCollection.deleteOne(query);
  res.send(result);
});

console.log("Connected to MongoDB");

app.get("/", (req, res) => {
  res.send("PawMart Server is working");
});

app.listen(port, () => {
  console.log(`Server on port ${port}`);
});

module.exports = app;
