

export class BusStop{
    public id:string
    constructor(jsonObj:object){
        this.id = jsonObj['id']
    }
}