import dotenv from "dotenv"
import { ConnectDB } from "./db/index.js"
import { app } from "./app.js"
import * as models from "./models/relation.js" // Registers models & associations

dotenv.config()

ConnectDB()
.then(() => {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
        console.log("Server is running at port: ", port)
    })
})
.catch((error) => {
    console.log("SQL connection failed ", error)
    process.exit(1)
})
