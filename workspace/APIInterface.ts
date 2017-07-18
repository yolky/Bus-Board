import * as request from "request"
import {BusStop} from "./dataContainers/busStop"
import {IncomingBus} from "./dataContainers/incomingBus"
import {StopAndIncomingBuses} from "./dataContainers/stopAndIncomingBuses"


export class APIInterface{
    public constructor(){

    }

    public static busStopsWithinRadius(coordinates:Array<number>, radius:number):Promise<BusStop[]>{
        return new Promise((resolve,reject)=>{
            let requestURL: string = 'https://api.tfl.gov.uk/StopPoint?stopTypes=NaptanPublicBusCoachTram&radius='+radius.toString()+'&useStopPointHierarchy=false&lat='
            +coordinates[1]+'&lon='+ coordinates[0];
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
        return APIInterface.busStopsWithinRadius(coordinates, distance).then((listOfStops:Array<object>) => {
            if (!listOfStops){
                return APIInterface.findNearest2BusStops(coordinates, Math.floor(distance*1.2));
            }
            else if (listOfStops.length<2){
                return APIInterface.findNearest2BusStops(coordinates, Math.floor(distance*1.2));
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
}