import * as express from "express"
import * as cors from "cors"

export class Server{
    private app;

    public constructor(){
        this.app = express();
    }

    public listen(port: number){
        this.app.listen(port, () => {
            console.log(`Bus Board API listening on port ${port}!`);
        });
    }

    public enableCORS(){
        this.app.use(cors());
    }

    public addGET(url:string, callBack){
        this.app.get(url, callBack);
    }
}