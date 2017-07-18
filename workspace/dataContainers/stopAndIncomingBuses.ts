import {BusStop} from "./busStop"
import {IncomingBus} from "./incomingBus"

export class StopAndIncomingBuses{
    public incomingBuses = []
    public busStop: BusStop;

    public constructor(busStop: BusStop){
        this.busStop = busStop;
    }

    
    public addBus(incomingBus: IncomingBus):void {
        if(this.incomingBuses.length<5){
            this.incomingBuses.push(incomingBus);
        }
    }
}