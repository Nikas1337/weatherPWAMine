var app = {
    isLoading: true,
    visibleCards: {},
    selectedCities: [],
    cardTemplate: document.querySelector('.card-template .template'),
    container: document.querySelector('#app'),
    addDialog: document.querySelector('.dialog-container'),
    pushDialog: document.querySelector('.open-dialog'),
    selectCity: document.querySelector('.choose-city'),
    update: document.querySelector('.update'),
    daysOfWeek: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    current:0,
    timer: document.querySelector(".clock"),
    newList:[],
    fullcities:[]
};
var getTime = function () {
    var date = new Date();
    var dOfWeek = "";
    switch (date.getDay()) {
        case 0:
            dOfWeek = app.daysOfWeek[0];
            break;
        case 1:
            dOfWeek = app.daysOfWeek[1];
            break;
        case 2:
            dOfWeek = app.daysOfWeek[2];
            break;
        case 3:
            dOfWeek = app.daysOfWeek[3];
            break;
        case 4:
            dOfWeek = app.daysOfWeek[4];
            break;
        case 5:
            dOfWeek = app.daysOfWeek[5];
            break;
        case 6:
            dOfWeek = app.daysOfWeek[6];
            break;
    }
    var nullOrNot = function (hms) {
        if (hms < 10 ){
            return "0" + hms;
        }
        return hms
    };
    var mins = nullOrNot(date.getMinutes());
    var hours = nullOrNot(date.getHours());
    var month = nullOrNot(date.getMonth()+1);
    var day = nullOrNot(date.getDate());
    return {mins:mins,hours:hours,month:month,day:day,dOfWeek:dOfWeek}
};

var APIKey = '4d1c3563a5585646e0f0269852da6a2c&units=metric';
var delKey = document.querySelectorAll('.del');
var getResponse = function (resp) {
    console.log(app.newList);
    var temp = app.cardTemplate.cloneNode();
    temp.innerHTML = app.cardTemplate.innerHTML;
    var rusname ="";
    for (let i = 0; i < app.newList.length; i++) {
        if (resp.name == app.newList[i].name) {
            rusname = app.newList[i].rusname;
        }
    }
    var time = getTime();
    temp.innerHTML = temp.innerHTML
        .replace("{city}", rusname)
        .replace("{temp}", Math.floor(resp.main.temp) + "&deg; C")
        .replace("{weatherNow}", resp.weather[0].description)
        .replace("{windNow}",resp.wind.speed +" м/c")
        .replace("{humidity}", resp.main.humidity+ "%");
    var lastTime = "Последний раз обновлялось в " + time.hours +":" +time.mins + " " +time.day+"."+time.month;
    app.timer.innerHTML = lastTime;
    // app.fullcities.push({name:resp.name, main:{temp:resp.main.temp, humidity:resp.main.humidity}, weather:[{description:resp.weather[0].description}], wind:{speed:resp.wind.speed}, lastTime:lastTime});
    // window.localforage.setItem('fullList', app.fullcities);
    app.container.appendChild(temp);
    if (resp.weather[0].description == "ясно") {
        temp.children[3].innerHTML = "";
        temp.children[3].style.backgroundImage = "url(/weatherPWAMine/images/clear.png)";
    } else if (resp.weather[0].description == "пасмурно") {
        temp.children[3].innerHTML = "";
        temp.children[3].style.backgroundImage = "url(/weatherPWAMine/images/cloudy.png)";
    } else if (resp.weather[0].description == "слегка облачно") {
        temp.children[3].innerHTML = "";
        temp.children[3].style.backgroundImage = "url(/weatherPWAMine/images/partly-cloudy.png)";
    } else if (resp.weather[0].description == "легкий дождь") {
        temp.children[3].innerHTML = "";
        temp.children[3].style.backgroundImage = "url(/weatherPWAMine/images/cloudy-scattered-showers.png)";
    } else if (resp.weather[0].description == "облачно") {
        temp.children[3].innerHTML = "";
        temp.children[3].style.backgroundImage = "url(/weatherPWAMine/images/cloudy.png)";
    } else if (resp.weather[0].description == "мокрый снег") {
        temp.children[3].innerHTML = "";
        temp.children[3].style.backgroundImage = "url(/weatherPWAMine/images/sleet.png)";
    }
    temp.setAttribute('data', app.current);
    app.current+=1;
    temp.firstElementChild.addEventListener('click',function () {
        var dataCur = parseInt(temp.getAttribute('data'));
        app.selectedCities.splice(dataCur, 1);
        window.localforage.setItem('selectedCities', app.selectedCities);
        console.log(app.selectedCities);
        this.parentElement.style.opacity = 0;
        setTimeout(() => {
            this.parentElement.remove();
        },400)

    })
};
var close = function () {
    $('.dialog-wrap').animate({'opacity' : 0}, 200);
    $('.dialog-wrap').animate({'z-index': -1}, 1);

}
var buildList = function(items) {
    for (let i = 0; i < items.length ; i++) {
        app.addDialog.innerHTML += "<option value='"+items[i].rusname+"' data='"+ i +"'>" + items[i].rusname + "</option>"
    }
};
$('.open-dialog').click(function () {

        $('.dialog-wrap').animate({'z-index': 9999}, 1);
        $('.dialog-wrap').animate({'opacity' : 1}, 200)

});
$('.close').click(function () {
    close()
});

$('.update').click(function () {
    $('#app').html("");
    app.current =0;
    app.selectedCities.forEach(function (city) {
        app.addCity(city.label);
    })
});
app.selectCity.addEventListener('click', function () {
    var selected = app.addDialog.options[app.addDialog.selectedIndex];
    var cityName = selected.value;
    var key = app.addDialog.selectedIndex;
    app.selectedCities.push({key: key, label: cityName});
    window.localforage.setItem('selectedCities', app.selectedCities);
    app.addCity(cityName);
});
app.addCity = function (cn) {
    var apiEx = 'https://api.openweathermap.org/data/2.5/weather?q=' + cn +',ru&appid=' + APIKey+"&lang=ru";
    $.ajax ({
        type: "GET",
        url: apiEx,
        error: function (e) {
            $('#app').html("<div class='template'><h1 align='center'>Ошибка подключения к сервису погоды, попробуйте позже</h1></div>")
        },
        success: function(result) {
            getResponse(result);
            close()
        }
    })
};
window.addEventListener('DOMContentLoaded', function () {
    window.localforage.getItem('selectedCities', function (err, cityList) {
        if (cityList) {
            app.selectedCities = cityList;
            app.selectedCities.forEach(function (city) {
                app.addCity(city.label);
            })
        } else {

        }
    })
});
// window.addEventListener('DOMContentLoaded', function () {
//     window.localforage.getItem('fullList', function (err, cityList) {
//         if (cityList) {
//             app.fullcities = cityList;
//             app.fullcities.forEach(function (city) {
//                 getResponse(city);
//             })
//             app.fullcities = [];
//         } else {
//
//         }
//     })
// });

var jsonCities = [];
$.ajax({
    type: "GET",
    url: '/weatherPWAMine/city-list.json',
    success: function (res) {
        console.log(res);
        jsonCities = res;
        var newList = []
        for (let i = 0; i < jsonCities.length; i++) {
            if (jsonCities[i].country == "RU") {
                app.newList.push(jsonCities[i]);
            }

        }
        buildList(app.newList);

    }
});
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/weatherPWAMine/service-worker.js')
        .then(function() {
            console.log('Service Worker Registered');
        });
}



