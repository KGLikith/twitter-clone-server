import initServer from "./app";
import * as dotenv from "dotenv";

dotenv.config();

async function init() {
  const app = await initServer();

  app.get('/',(req,res)=>{
    res.status(200).send({message:"Server is running"})
  })

  app.listen(8000, () => {
    console.log("server started at http://localhost:8000");
  });
}

init();
