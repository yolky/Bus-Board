import * as readline from "readline"
import * as request from "request"
import * as express from "express"
import {BusStop} from "./dataContainers/busStop"
import {IncomingBus} from "./dataContainers/incomingBus"
import {StopAndIncomingBuses} from "./dataContainers/stopAndIncomingBuses"
import {APIInterface} from "./APIInterface"
import {Server} from "./server"





const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export class Main {
    public run(): void {

        let myServer:Server = new Server();
        
        myServer.listen(3000);
        myServer.enableCORS();

        myServer.addGET('/closestStops', (req, res) => {
            console.log(req.url)
            let postCode:string = req.query.postCode;
            console.log(req.query)
            
            APIInterface.coordinatesGivenPostcode(postCode).then((coordinates: number[])=>{
                return APIInterface.findNearest2BusStops(coordinates);
            }).then((listOfStops:Array<BusStop>)=>{
                let nearest2 = listOfStops.slice(0,2);              
                return Promise.all([APIInterface.nextBusesGivenStopCode(nearest2[0]),APIInterface.nextBusesGivenStopCode(nearest2[1])])
            }).then((values:Array<StopAndIncomingBuses>)=>{
                res.send(values);
            }).catch((err:Error)=>{
                console.log(err)
                res.status(400).send(err.message);
            });
        });
        
        

    }
    // Returns a promise resolving with a list of BusStop objects representing busstops within given radius of coordinates[]
    
}

