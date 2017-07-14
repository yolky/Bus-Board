import * as readline from "readline"
import * as request from "request"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export class Main {
    public run(): void {



        let coordinatePromise = new Promise((resolve,reject)=>{
            Main.askQuestionAsync("Enter postcode:\t", Main.coordinatesGivenPostcode,resolve);
        });
        coordinatePromise.then((coordinates)=>{
            console.log(coordinates)
        });



        let stopPromise = new Promise((resolve,reject)=>{
            Main.askQuestionAsync("Please enter stop code:\t", Main.nextBusesGivenStopCode,resolve);
        });
        stopPromise.then((first5)=>{
            for (let i:number = 0; i<5; i++){
                let splitTime:Array<string> = first5[i]['expectedArrival'].split("T");
                console.log("Route name: ", first5[i]['lineName']);
                console.log("Destination: ", first5[i]['destinationName']);
                console.log("Expected arrival time: ", splitTime[1].substr(0,splitTime[1].length-1));
                console.log();
            }
        });

    }

    public static nextBusesGivenStopCode(stopCode:string, resolve):void{
        let first5:Object[] = [];
        request('https://api.tfl.gov.uk/StopPoint/' + stopCode + '/Arrivals', function (error, response, body) {
            // console.log('error:', error); 
            first5 = JSON.parse(body).slice(0,5);
            
            resolve(first5);
        });
    }

    public static coordinatesGivenPostcode(postCode:string, resolve){
        request('https://api.postcodes.io/postcodes/' + postCode, function (error, response, body) {
            // console.log('error:', error); 
            let coordinates: number[] = [JSON.parse(body)['result']['longitude'], JSON.parse(body)['result']['latitude']];
            //console.log(coordinates);
            resolve(coordinates);
        });
    }

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

