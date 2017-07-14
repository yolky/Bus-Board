import * as readline from "readline"
import * as request from "request"
import * as express from "express"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export class Main {
    public run(): void {

        const app = express()

        app.get('/closestStops/:postCode', (req, res) => {
            console.log(req.params)
            let coordinatePromise = new Promise((resolve,reject)=>{
                // Main.askQuestionAsync("Enter postcode:\t", Main.coordinatesGivenPostcode,resolve);
                Main.coordinatesGivenPostcode(req.params['postCode'], resolve);
            });
            coordinatePromise.then((coordinates:Array<number>)=>{
                Main.busStopsWithinRadius(coordinates, 500, (list)=>{
                    let nearest2 = list.slice(0,2);
                    // console.log(nearest2)
                    // console.log("Next buses arriving at ",nearest2[0]['commonName'] , " :");
                    Main.nextBusesGivenStopCode(nearest2[0]['id'],(listOfBuses1) => {
                        Main.nextBusesGivenStopCode(nearest2[1]['id'],(listOfBuses2) => {                            
                            res.send(listOfBuses1.slice(0,5).concat(listOfBuses2.slice(0,5)))
                        });
                    });
                    // console.log("Next buses arriving at ",nearest2[1]['commonName'] , " :");
                    
                });
            });
            
        })
        // app.get('/', function (req, res) {
        //     res.send('Hello World!')
        // });

        app.listen(3000, function () {
            console.log('Example app listening on port 3000!')
        });

        // let stopPromise = new Promise((resolve,reject)=>{
        //     Main.askQuestionAsync("Please enter stop code:\t", Main.nextBusesGivenStopCode,resolve);
        // });
        // stopPromise.then(Main.listFirstFive)


        // let coordinatePromise = new Promise((resolve,reject)=>{
        //     // Main.askQuestionAsync("Enter postcode:\t", Main.coordinatesGivenPostcode,resolve);
        //     Main.coordinatesGivenPostcode('n70eu', resolve);
        // });
        // coordinatePromise.then((coordinates:Array<number>)=>{
        //     Main.busStopsWithinRadius(coordinates, 500, (list)=>{
        //         let nearest2 = list.slice(0,2);
        //         // console.log(nearest2)
        //         // console.log("Next buses arriving at ",nearest2[0]['commonName'] , " :");
        //         Main.nextBusesGivenStopCode(nearest2[0]['id'],Main.listFirstFive);
        //         // console.log("Next buses arriving at ",nearest2[1]['commonName'] , " :");
        //         Main.nextBusesGivenStopCode(nearest2[1]['id'],Main.listFirstFive);
        //     });
        // });


    }
    // callbackFunction is called with list of busstops within radius
    public static busStopsWithinRadius(coordinates:Array<number>, radius:number, callbackFunction){
        let listOfStops:Array<object>
        request('https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram&radius='+radius.toString()+'&useStopPointHierarchy=false&lat='
        +coordinates[1]+'&lon='+ coordinates[0], function (error, response, body) {
            listOfStops = JSON.parse(body)['stopPoints'];
            callbackFunction(listOfStops);
        });
    }

    // callbackFunction is called with list of next buses at given stopcode
    public static nextBusesGivenStopCode(stopCode:string, callbackFunction):void{
        let listOfBuses:Object[] = [];
        request('https://api.tfl.gov.uk/StopPoint/' + stopCode + '/Arrivals', function (error, response, body) {
            // console.log('error:', error); 
            listOfBuses = JSON.parse(body);
            listOfBuses.sort((a,b) => {
                return a['timeToStation']-b['timeToStation']
            })
            callbackFunction(listOfBuses);
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
    public static coordinatesGivenPostcode(postCode:string, callbackFunction){
        request('https://api.postcodes.io/postcodes/' + postCode, function (error, response, body) {
            // console.log('error:', error); 
            let coordinates: number[] = [JSON.parse(body)['result']['longitude'], JSON.parse(body)['result']['latitude']];
            //console.log(coordinates);
            callbackFunction(coordinates);
        });
    }

    // Asks a question and runs functionToCall() with the answer
    public static askQuestionAsync(prompt:string, functionToCall, resolve){
        let functionPromise = new Promise((resolve2,reject)=>{
            rl.question(prompt, (answer)=>{
                functionToCall(answer,resolve2);
            });
        });
        functionPromise.then((answer)=>{
            resolve(answer)
        });
    }
}

