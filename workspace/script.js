window.onload = getStopData;

setInterval(getStopData, 30000);

var xhttp = new XMLHttpRequest();

function getStopData(){
    var postCode = document.getElementById('postCodeForm').elements[0].value;
    xhttp.open("GET", "http://localhost:3000/closestStops?postCode="+postCode, false);

    xhttp.send();

    
    if(xhttp.status==200){
        var response = JSON.parse(xhttp.responseText);
    }
    else if(xhttp.status==400 || xhttp.status== 404){
        window.open('./error.html')
    }
    
    //document.getElementById('dynamicText').innerHTML = response[0][0]['destinationName'];
    showResults(response)
}

function showResults(listOfStops){
    document.getElementById('title0').innerHTML = listOfStops[0][0].stationName;
    document.getElementById('title1').innerHTML = listOfStops[1][0].stationName;
    table0 = document.getElementById('table0');
    var tableToModify = table0;
    for(var i =1; i<tableToModify.rows.length; i++){
        tableToModify.rows[i].cells[0].innerHTML = listOfStops[0][i-1].destinationName;
        tableToModify.rows[i].cells[1].innerHTML = listOfStops[0][i-1].lineName;
        tableToModify.rows[i].cells[2].innerHTML = listOfStops[0][i-1].expectedArrival;
    
        tableToModify.rows[i].cells[0].setAttribute('align', 'center');
        tableToModify.rows[i].cells[1].setAttribute('align', 'center');
        tableToModify.rows[i].cells[2].setAttribute('align', 'center');
    }

    table1 = document.getElementById('table1');
    var tableToModify = table1;
    for(var i =1; i<tableToModify.rows.length; i++){
        tableToModify.rows[i].cells[0].innerHTML = listOfStops[1][i-1].destinationName;
        tableToModify.rows[i].cells[1].innerHTML = listOfStops[1][i-1].lineName;
        tableToModify.rows[i].cells[2].innerHTML = listOfStops[1][i-1].expectedArrival;
        
        tableToModify.rows[i].cells[0].setAttribute('align', 'center');
        tableToModify.rows[i].cells[1].setAttribute('align', 'center');
        tableToModify.rows[i].cells[2].setAttribute('align', 'center');
    }
}