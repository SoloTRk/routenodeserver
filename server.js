const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;


app.use(bodyParser.json());

var router = express.Router();
//Tüm yönlendirmelerimizi /api yoluyla kaydediyoruz
// app.use('/api', router);


app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});

app.listen(3000, () => {
    console.log('Server ' + port + ' portu üzerinde çalışmaya başladı!');
});

app.get('/', (req, res) => {
    res.send('Merhaba Dünya!');
});

var locations = [];
var data;

app.post('/api/v1/sortlocations', (req, res) => {
    console.log('Istek geldi')
    console.log(req.body.locations.length);
    console.log(req.body);
    if (req.body.locations.length == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'Konum objesi gerekli'
        });
    } else {
        data = req.body;
        load();
        return res.status(201).send({
            success: 'true',
            message: 'sorted successfully',
            data

        })
    }
});

function load() {

    return new Promise(resolve => {

        data = applyHaversine(data.locations);
        console.log('HAVERSINE DATA', data);

        data.sort((locationA, locationB) => {
            return locationA.distance - locationB.distance;
        });
        console.log('SIRALANMIS LOKASYONLAR', data);
        resolve(data);


    });
   
}

function applyHaversine(locations) {

    let sutkonagi = {
        lat: 41.486752,
        lng: 35.953623
    };

    locations.map((location) => {

        let placeLocation = {
            lat: location.latitude,
            lng: location.longitude
        };

        location.distance = getDistanceBetweenPoints(
            sutkonagi,
            placeLocation,
            'km'
        ).toFixed(2);
    });

    return locations;
}

function getDistanceBetweenPoints(start, end, units) {

    let earthRadius = {
        miles: 3958.8,
        km: 6371
    };

    let R = earthRadius[units || 'km'];
    let lat1 = start.lat;
    let lon1 = start.lng;
    let lat2 = end.lat;
    let lon2 = end.lng;

    let dLat = toRad((lat2 - lat1));
    let dLon = toRad((lon2 - lon1));
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;

    return d;

}

function toRad(x) {
    return x * Math.PI / 180;
}
