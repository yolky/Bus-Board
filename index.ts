import { Main } from './workspace/main'
import * as XMLHttpRequest from 'xmlhttprequest' 

export class Index {
    public static main(): number {
        const template = new Main();
        template.run();

        // var xhttp = new XMLHttpRequest.XMLHttpRequest();
        // xhttp.open("GET", "http://localhost:3000/closestStops?postCode=nw51tl", false);
        // xhttp.setRequestHeader("Content-type", "application/json");

        // xhttp.send();
        // var response = JSON.parse(xhttp.responseText);

        return 0;
    }
}

Index.main();