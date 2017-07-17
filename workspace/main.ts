import * as readline from "readline"
import * as request from "request"
import * as express from "express"
import {BusStop} from "./busStop"
import {IncomingBus} from "./incomingBus"


import * as cors from "cors"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export class Main {
    public run(): void {

        const app = express()

        

        app.use(cors());

        app.get('/closestStops', (req, res) => {
            console.log(req.url)
            let postCode:string = req.query.postCode;
            console.log(req.query)
            Main.coordinatesGivenPostcode(postCode).then((coordinates: number[])=>{
                return Main.findNearest2BusStops(coordinates);
            }).then((listOfStops:Array<BusStop>)=>{
                let nearest2 = listOfStops.slice(0,2);              
                return Promise.all([Main.nextBusesGivenStopCode(nearest2[0]),Main.nextBusesGivenStopCode(nearest2[1])])
            }).then((values:Array<Array<IncomingBus>>)=>{
                let bothBuses: Array<Array<IncomingBus>> = [values[0].slice(0,5),values[1].slice(0,5)];
                res.send(bothBuses);
            }).catch((err:Error)=>{
                console.log(err)
                res.status(400).send(err.message);
            });
        });
        
        app.listen(3000, function () {
            console.log('Example app listening on port 3000!')
        });


    }
    // Returns a promise resolving with a list of BusStop objects representing busstops within given radius of coordinates[]
    public static busStopsWithinRadius(coordinates:Array<number>, radius:number):Promise<BusStop[]>{
        return new Promise((resolve,reject)=>{
            let listOfStops:Array<object>
            request('https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram&radius='+radius.toString()+'&useStopPointHierarchy=false&lat='
            +coordinates[1]+'&lon='+ coordinates[0], function (error, response, body) {
                listOfStops = JSON.parse(body)['stopPoints'];
                if(!listOfStops){
                    resolve([]);
                }
                else{
                    let ans:Array<BusStop> = []
                    for (let i:number = 0; i<listOfStops.length; i++){
                        ans.push(new BusStop(listOfStops[i]))
                    }
                    resolve(ans)
                }
            });
        });
    }



    public static findNearest2BusStops(coordinates: Array<number>, distance:number = 200):Promise<BusStop[]> {
        return Main.busStopsWithinRadius(coordinates, distance).then((listOfStops:Array<object>) => {
            if (!listOfStops){
                // console.log(distance);
                return Main.findNearest2BusStops(coordinates, Math.floor(distance*1.2));
            }
            else if (listOfStops.length<2){
                // console.log(distance);
                return Main.findNearest2BusStops(coordinates, Math.floor(distance*1.2));
            }
            else{
                return new Promise((resolve, reject) => {
                    resolve(listOfStops);
                })
            }
        })
    }

    // callbackFunction is called with list of next buses at given stopcode
    public static nextBusesGivenStopCode(busStop:BusStop):Promise<Array<IncomingBus>>{
        let stopCode:string = busStop.id
        return new Promise((resolve,reject)=>{
            let listOfBuses:IncomingBus[] = [];
            request('https://api.tfl.gov.uk/StopPoint/' + stopCode + '/Arrivals', function (error, response, body) {
                // console.log('error:', error); 
                listOfBuses = JSON.parse(body);
                listOfBuses.sort((a,b) => {
                    return a['timeToStation']-b['timeToStation']
                })
                let ans:Array<IncomingBus> = []
                for (let i:number = 0; i<listOfBuses.length; i++){
                    ans.push(new IncomingBus(listOfBuses[i]));
                }
                resolve(ans);
            });
        });
    }

    // Given a list of buses prints first five with some information
    public static listFirstFive(listOfBuses: Array<Object>){
        console.log("Next buses arriving at ",listOfBuses[0]['stationName'] , " :");        
        for (let i:number = 0; i<5; i++){
            let splitTime:Array<string> = listOfBuses[i]['expectedArrival'].split("T");
            console.log("Route name: ", listOfBuses[i]['lineName']);
            console.log("Destination: ", listOfBuses[i]['destinationName']);
            console.log("Expected arrival time: (GMT time) ", splitTime[1].substr(0,splitTime[1].length-1));
            console.log();
        }
    }

    // callbackFunction is called with coordinates of postcode
    public static coordinatesGivenPostcode(postCode:string,){
        return new Promise((resolve,reject)=>{
            request('https://api.postcodes.io/postcodes/' + postCode, function (error, response, body) {
                try{
                    let coordinates: number[] = [JSON.parse(body)['result']['longitude'], JSON.parse(body)['result']['latitude']];
                    resolve(coordinates);
                }catch(err){
                    reject(new Error('Error 400: Invalid postcode'));
                }
                
            });
        });
    }

    // Asks a question and runs functionToCall() with the answer
    public static askQuestionAsync(prompt:string){
        return new Promise((resolve,reject)=>{
            rl.question(prompt, (answer)=>{
                resolve(answer);
            });
        });
    }
}

