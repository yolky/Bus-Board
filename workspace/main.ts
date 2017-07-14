import * as readline from "readline"
import * as request from "request"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export class Main {
    public run(): void {
        let first5:Object[] = [];
        rl.question("Please enter stop code:\t", (stopCode) => {
            request('https://api.tfl.gov.uk/StopPoint/' + stopCode + '/Arrivals', function (error, response, body) {
                // console.log('error:', error); 
                first5 = JSON.parse(body).slice(0,5);
                for (let i:number = 0; i<5; i++){
                let splitTime:Array<string> = first5[i]['expectedArrival'].split("T");
                console.log("Route name: ", first5[i]['lineName']);
                console.log("Destination: ", first5[i]['destinationName']);
                console.log("Expected arrival time: ", splitTime[1].substr(0,splitTime[1].length-1));
                console.log();
                }
            });
        });
    }
}

