const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

// ========================================
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fe8tu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// ========================================
async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("pkGeniusCar").collection("services");
    const orderCollection = client.db("pkGeniusCar").collection("orderPK1");

    function Token(req, res, next) {
      const autHeader = req.headers.authorization;
      console.log(autHeader);
      if (!autHeader) {
        return res.status(401).send({ messages: "unAuthorization" });
      }

      const token = autHeader.split(" ")[1];

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {

        if (err) {
         console.log(err);
          res.status(401).send("Forbidden accuses");

        }
      //   console.log("decode", decode);
        req.decoded = decode;
        next();
      });
    }

    /* all database for data server for client side  */
    app.get("/order", Token, async (req, res) => {
      const decodeEmail = req.decoded?.email;
      const email = req.query.email;

      if (decodeEmail === email) {
        const query = { email: email };
        const cursor = orderCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } else {
        res.status(401).send("Forbidden accuses");
      }
    });

    /* create jwt token and send client side login page and localStorage set */
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    /* get user all database store server for client */
    app.get("/service",  async (req, res) => {
      const query = {};
      const result = serviceCollection.find(query);
      const service = await result.toArray();
      res.send(service);
    });

    /* get user single id database from server  form client side */
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });

    /* post service client for database add - help her server  */
    app.post("/service", async (req, res) => {
      const query = req.body;
      console.log("query", query);
      const result = await serviceCollection.insertOne(query);
      console.log("reslut", result);
      res.send(result);
    });

    /*   delete method single services for delete for database then client side */

    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    /* post from client data and store  mongodb  */
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);
// ========================================
app.get("/", (req, res) => {
  res.send("Genius car server is running");
});

app.listen(port, () => {
  console.log(`Running server port ${port}`);
});
