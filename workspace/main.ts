import * as readline from "readline"
import * as request from "request"
import * as express from "express"
import {BusStop} from "./busStop"
import {IncomingBus} from "./incomingBus"
import {StopAndIncomingBuses} from "./stopAndIncomingBuses"



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
            }).then((values:Array<StopAndIncomingBuses>)=>{
                res.send(values);
            }).catch((err:Error)=>{
                console.log(err)
                res.status(400).send(err.message);
            });
        });
        
        app.listen(3000, () => {
            console.log('Example app listening on port 3000!')
        });

    }
    // Returns a promise resolving with a list of BusStop objects representing busstops within given radius of coordinates[]
    public static busStopsWithinRadius(coordinates:Array<number>, radius:number):Promise<BusStop[]>{
        return new Promise((resolve,reject)=>{
            let requestURL: string = 'https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram&radius='+radius.toString()+'&useStopPointHierarchy=false&lat='
            +coordinates[1]+'&lon='+ coordinates[0];
            console.log(requestURL);
            let listOfStops:Array<BusStop>
            request(requestURL, (error, response, body) => {
                listOfStops = JSON.parse(body)['stopPoints'];
                if(!listOfStops){
                    resolve([]);
                }
                else{
                    let ans:Array<BusStop> = []
                    for (let i:number = 0; i<listOfStops.length; i++){
                        ans.push(new BusStop(listOfStops[i]['id'], listOfStops[i]['commonName']))
                        console.log(listOfStops[i]['stationName']);
                    }
                    resolve(ans)
                }
            });
        });
    }



    public static findNearest2BusStops(coordinates: Array<number>, distance:number = 200):Promise<BusStop[]> {
        if(distance > 4000){
            return new Promise((resolve, reject)=>{
                reject(new Error('No nearby bus stops'));
            });
        }
        return Main.busStopsWithinRadius(coordinates, distance).then((listOfStops:Array<object>) => {
            if (!listOfStops){
                return Main.findNearest2BusStops(coordinates, Math.floor(distance*1.2));
            }
            else if (listOfStops.length<2){
                return Main.findNearest2BusStops(coordinates, Math.floor(distance*1.2));
            }
            else{
                return new Promise((resolve, reject) => {
                    resolve(listOfStops);
                })
            }
        })
    }

    public static nextBusesGivenStopCode(busStop:BusStop):Promise<StopAndIncomingBuses>{
        let stopCode:string = busStop.id
        return new Promise((resolve,reject)=>{
            let requestURL: string = 'https://api.tfl.gov.uk/StopPoint/' + stopCode + '/Arrivals'
            let listOfBuses:IncomingBus[] = [];
            let ans = new StopAndIncomingBuses(busStop);
            request(requestURL, (error, response, body) => {
                listOfBuses = JSON.parse(body);
                listOfBuses.sort((busA,busB) => {
                    return busA['timeToStation']-busB['timeToStation']
                })
                for (let i:number = 0; i<listOfBuses.length; i++){
                    let currentBus: IncomingBus = new IncomingBus(listOfBuses[i]['stationName'], listOfBuses[i]['destinationName'],
                        listOfBuses[i]['lineName'], listOfBuses[i]['expectedArrival']);
                    ans.addBus(currentBus);
                }
                resolve(ans);
            });
        });
    }

    public static coordinatesGivenPostcode(postCode:string,){
        return new Promise((resolve,reject)=>{
            let requestURL: string = 'https://api.postcodes.io/postcodes/' + postCode;
            request(requestURL, (error, response, body) => {
                try{
                    let coordinates: number[] = [JSON.parse(body)['result']['longitude'], JSON.parse(body)['result']['latitude']];
                    resolve(coordinates);
                }catch(err){
                    reject(new Error('Error 400: Invalid postcode'));
                }
                
            });
        });
    }

    public static askQuestionAsync(prompt:string){
        return new Promise((resolve,reject)=>{
            rl.question(prompt, (answer)=>{
                resolve(answer);
            });
        });
    }
}

