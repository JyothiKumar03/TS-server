import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import { json } from "stream/consumers";


const app: Express = express();
app.use(express.json())
const server = createServer(app);
const data = {
  message : "",
}
const io = new Server(server,{
  cors : {
    origin : "*",
    methods: ["GET","POST","PUT","DELETE"],
  }
});

app.use(
  cors({
    origin : "*",
    methods: ["GET","POST","PUT","DELETE"],
  })
)

dotenv.config();

const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});




io.on("connection", (socket:Socket) => {
  console.log("User Connected", socket.id);

  socket.on("message", ({ room, message }) => {
    console.log({ room, message });
    socket.to(room).emit("receive-message", message);
  });

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });

  socket.on("send-message",(data)=>{
    console.log("send message event listenend ", data)
  })
});


app.post("/intent", async (req: Request, res: Response) => {
  console.log("request got ->",req.body)
  const { data } =  req.body as any;
  if (data) {
    //console.log("data ->",data)
    // data.message = data;
    console.log("data received",data);
    // Emit a socket event named 'data-received' with the received data
    io.emit("data-received", { data });

    res.status(200).json({ data: `Data received ${data}` });
  } else {
    res.status(400).json({ error: "Invalid message parameter" });
  }
});

server.listen(port,() => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});