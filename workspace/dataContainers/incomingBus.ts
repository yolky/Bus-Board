

export class IncomingBus{
    stationName:string
    destinationName:string
    lineName:string
    expectedArrival:string
    constructor(stationName: string, destinationName: string, lineName: string,
        expectedArrival: string){
        this.stationName = stationName;
        this.destinationName = destinationName; 
        this.lineName = lineName; 
        this.expectedArrival = expectedArrival.split("T")[1]; 
        this.expectedArrival = this.expectedArrival.slice(0,this.expectedArrival.length - 1);
        this.expectedArrival = ((Number(this.expectedArrival.substring(0,2))+1)%24).toString()+this.expectedArrival.substring(2);
    }
}