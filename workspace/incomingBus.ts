

export class IncomingBus{
    stationName:string
    destinationName:string
    lineName:string
    expectedArrival:string
    constructor(incomingBusesObj:object){
        this.stationName = incomingBusesObj['stationName'];
        this.destinationName = incomingBusesObj['destinationName']; 
        this.lineName = incomingBusesObj['lineName']; 
        this.expectedArrival = incomingBusesObj['expectedArrival'].split("T")[1]; 
        this.expectedArrival = this.expectedArrival.slice(0,this.expectedArrival.length - 1);
    }
}