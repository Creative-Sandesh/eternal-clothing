import {ConnectDB} from "./db/index.js"
import express from "express"
import dotenv from "dotenv"
dotenv.config()

const app = express()
ConnectDB()
.then(()=>{
    app.listen(process.env.PORT || 5000, () => {
        console.log("Server is running at port: ", process.env.PORT)
    })
})
.catch((error) => {
    console.log("SQL connection failed ", error )
})
