import * as readline from "readline"
import * as request from "request"
import * as express from "express"

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
            }).then((listOfStops:Array<object>)=>{
                let nearest2 = listOfStops.slice(0,2);
                return Promise.all([Main.nextBusesGivenStopCode(nearest2[0]['id']),Main.nextBusesGivenStopCode(nearest2[1]['id'])])
            }).then((values:Array<Array<Object>>)=>{
                let bothBuses: Array<object> = [values[0].slice(0,5),values[1].slice(0,5)];
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
    // callbackFunction is called with list of busstops within radius
    public static busStopsWithinRadius(coordinates:Array<number>, radius:number):Promise<object[]>{
        return new Promise((resolve,reject)=>{
            let listOfStops:Array<object>
            request('https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram&radius='+radius.toString()+'&useStopPointHierarchy=false&lat='
            +coordinates[1]+'&lon='+ coordinates[0], function (error, response, body) {
                listOfStops = JSON.parse(body)['stopPoints'];
                resolve(listOfStops);
            });
        });
    }



    public static findNearest2BusStops(coordinates: Array<number>, distance:number = 100):Promise<object[]> {
        return Main.busStopsWithinRadius(coordinates, distance).then((listOfStops:Array<object>) => {
            if (!listOfStops){
                return Main.findNearest2BusStops(coordinates, distance+100)
            }
            else if (listOfStops.length<2){
                return Main.findNearest2BusStops(coordinates, distance + 100)
            }
            else{
                return new Promise((resolve, reject) => {
                    resolve(listOfStops)
                })
            }
        })
        
        // console.log(distance);
        // return new Promise((resolve, reject) => {
        //     Main.busStopsWithinRadius(coordinates, distance).then((listOfStops:Array<object>) => {
        //         if(!listOfStops){
        //             return Main.findNearest2BusStops(coordinates,distance+100);
        //         }
        //         else if (listOfStops.length<2){
        //             console.log(listOfStops.length)
        //             return Main.findNearest2BusStops(coordinates,distance+100);
        //         }
        //         else{
        //             console.log(listOfStops.length)
        //             console.log("test")
        //             resolve(listOfStops)
        //         }
        //     })
        // });
    }

    // callbackFunction is called with list of next buses at given stopcode
    public static nextBusesGivenStopCode(stopCode:string){
        return new Promise((resolve,reject)=>{
            let listOfBuses:Object[] = [];
            request('https://api.tfl.gov.uk/StopPoint/' + stopCode + '/Arrivals', function (error, response, body) {
                // console.log('error:', error); 
                listOfBuses = JSON.parse(body);
                listOfBuses.sort((a,b) => {
                    return a['timeToStation']-b['timeToStation']
                })
                resolve(listOfBuses);
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

