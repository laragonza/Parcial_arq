import { MongoClient,  ObjectId} from 'mongodb'

const MONGODB_URI = 'mongodb+srv://laragonza1294:passwordlara@nebrija-cluster.uokzc.mongodb.net/?retryWrites=true&w=majority&appName=Nebrija-Cluster';
//const MONGODB_URI = Deno.env.get("MONGODB_URI") || "";
const DB_NAME = Deno.env.get("DB_NAME") || "todo_db";

if (!MONGODB_URI) {
  console.error("MONGODB_URI no esta set");
  Deno.exit(1);
}

const client = new MongoClient(MONGODB_URI);

try {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  console.log("Conectado a MongoDB");
} catch (error) {
  console.error("Error al conectarse con MongoDB:", error);
  Deno.exit(1);
}

const db = client.db(DB_NAME);
const todos = db.collection("todos");

export { db, todos };

const PORT = 3000;

export interface Libros {

  Título: string;
  Autores?: Autores[];
  CopiasDisponibles: string;

}
export interface Autores {

  _id?: ObjectId;
  Autores: string;
  Biografía: string;

}




async function handler(req: Request): Promise<Response> {
  
    const url = new URL(req.url);
    const path = url.pathname;
    
 if (req.method === "POST" && path === "/libro") {
  return await addTodo(req);

} else if (req.method === "GET" && path === " /libros") {
  return await getTodos();

} else if (req.method === "GET" && path === "/libro") {

  return await getTodos();
} else if (req.method === "PUT" && path.startsWith("/libro")) {
  const id = path.split("/")[3];
  return await updateTodo(id, req);

} else if (req.method === "DELETE" && path.startsWith("/libro")) {
 const id = path.split("/")[3];
  return await deleteTodo(id);
} else if (req.method === "POST" && path === "/autor") {
  return await addTodo(req);


}
    return new Response(JSON.stringify({ }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  
}


console.log(`HTTP webserver running. Access it at: http://localhost:${PORT}/`);
Deno.serve({ port: PORT }, handler);



async function addTodo(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const result = await todos.insertOne(body);
    return new Response(JSON.stringify({ id: result.insertedId }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "400 Bad Request"  }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
export { addTodo };


async function getTodos(): Promise<Response> {
  try {
    const allTodos = await todos.find().toArray();
    return new Response(JSON.stringify(allTodos), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "400 Bad Request"  }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export { getTodos };

// ... existing code

async function getTodo(id: string): Promise<Response> {
  try {
    const todo = await todos.findOne({ _id: new ObjectId(id) });
    if (!todo) {
      return new Response(JSON.stringify({ error: "Todo not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(todo), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "400 Bad Request"  }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export { getTodo };
// ... existing code

async function updateTodo(id: string, req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const result = await todos.updateOne(
      { _id: new ObjectId(id) },
      { $set: body },
    );
    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: "Todo not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ updated: result.modifiedCount }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "400 Bad Request"  }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export { updateTodo };

// ... existing code

async function deleteTodo(id: string): Promise<Response> {
  try {
    const result = await todos.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: "Todo not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ deleted: result.deletedCount }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error:"400 Bad Request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export { deleteTodo };