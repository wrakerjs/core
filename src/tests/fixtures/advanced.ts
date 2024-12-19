import { defineWrakerApp } from "../../server";
const app = defineWrakerApp();

const items = new Map<string | number, any>();

app.use("/items", (req, res, next) => {
  if (!req.get("Authorization")) {
    res.status(401);
    throw new Error("Unauthorized.");
  }

  const token = req.get("Authorization");
  if (token !== "Bearer SUPER_SECRET_TOKEN") {
    res.status(403);
    throw new Error("Forbidden.");
  }

  next();
});

app.get("/items", (_, res) => {
  res.json(Array.from(items.entries()));
});

app.post("/items", (req, res) => {
  if (!req.body?.item) {
    res.status(400);
    throw new Error("Item data is missing.");
  }

  const item: { id: number | string; value: any } = req.body.item;
  if (!item.id || !item.value) {
    res.status(400);
    throw new Error("Malformed item.");
  }

  if (items.has(item.id)) {
    res.status(409);
    throw new Error("Item already exists.");
  }

  items.set(item.id, item.value);
  res.status(201);
  res.json({
    message: "Item succesfully added.",
  });
});

app.listen(() => {
  console.log("WrakerApp is running.");
});
