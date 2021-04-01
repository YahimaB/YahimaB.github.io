const API_KEY = "effc6aa9be9027cc342841c6e0cb6081";
const localCards = document.getElementById("local-cards");
const favouriteCardsList = document.getElementById('favourite-cards');

var desktopRefresh = document.getElementById("desktop-refresh");
var mobileRefresh = document.getElementById("mobile-refresh");
desktopRefresh.addEventListener("click", onRefreshGeo, false);
mobileRefresh.addEventListener("click", onRefreshGeo, false);

var searchField = document.getElementById("city-search");
var searchButton = document.getElementById("search-btn");
searchField.addEventListener("search", onSearchFunction, false);
searchButton.addEventListener("click", onSearchFunction, false);


window.onload = function() {
    onRefreshGeo();
    for (i = 0; i < localStorage.length; i++) {
        let cityName = localStorage.key(i);
        addFavouriteCity(cityName, true);
    }
};

function onRefreshGeo() {
    if (navigator.geolocation) {
        localCards.querySelector('.local-card-header h3').innerHTML = "Wait please...";
        localCards.querySelector('.local-card-header-content').style.display = "none";
        localCards.querySelector('.card-param-list').innerHTML = '';
        geo = navigator.geolocation.getCurrentPosition(onGeoSuccessCallback, onGeoFailedCallback);
    } else {
        alert(`Your browser doesn't support geolocation`);
    }
}

function onGeoSuccessCallback(position) {
    let lon = position.coords.longitude;
    let lat = position.coords.latitude;

    let weather_url = `https://api.openweathermap.org/data/2.5/weather?lon=${lon}&lat=${lat}&appid=${API_KEY}&units=metric`;
    let request = new XMLHttpRequest();
    request.responseType = "json";
    request.open("GET", weather_url);
    request.onload = function() {
        if (request.status !== 200) {
            alert(`Ошибка ${request.status}: ${request.statusText}`);
        } else {
            let answer = request.response;
            setupLocalCard(answer);
        }
    };
    request.send();
}

function onGeoFailedCallback() {
    let weather_url = `https://api.openweathermap.org/data/2.5/weather?q=saint+petersburg&appid=${API_KEY}&units=metric`;
    let request = new XMLHttpRequest();
    request.responseType = "json";
    request.open("GET", weather_url);
    request.onerror = function() {
        alert(`Ошибка ${request.status}`);
    }
    request.onload = function() {
        if (request.status !== 200) {
            alert(`Ошибка ${request.status}: ${request.statusText}`);
        } else {
            let answer = request.response;
            setupLocalCard(answer);
        }
    };
    request.send();
}

function setupLocalCard(answer) {
    localCards.querySelector('.local-card-header h3').innerHTML = answer.name;
    localCards.querySelector('.local-card-header-content').style.display = "flex";
    localCards.querySelector('.local-card-header-content p').innerHTML = Math.round(answer.main.temp) + '\u00B0C';
    localCards.querySelector('.local-card-header-content img').src = `http://openweathermap.org/img/wn/${answer.weather[0].icon}@2x.png`;
    updateAllParams(localCards, answer);
}

function onSearchFunction() {
    var searchBar = document.getElementById("city-search");
    var cityName = searchBar.value;
    searchBar.value = null;
    console.log(cityName);
    if (localStorage.getItem(cityName) == null) {
        addFavouriteCity(cityName, false);
    }
}

function addFavouriteCity(name, refreshed) {
    const weatherCard = document.createElement("li");
    weatherCard.classList.add("weather-card");
    weatherCard.append(document.getElementById('weather-card').content.cloneNode(true))
    weatherCard.querySelector('.card-header h3').innerText = "Wait pls...";
    weatherCard.querySelector('.card-header p').style.visibility = "hidden";
    weatherCard.querySelector('.card-header img').style.visibility = "hidden";
    favouriteCardsList.append(weatherCard);

    let url = `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${API_KEY}&units=metric`;
    let request = new XMLHttpRequest();
    request.responseType = "json";
    request.open("GET", url);
    request.send();
    request.onerror = function() {
        alert(`Ошибка ${request.status}`);
        closeCard(weatherCard);
    }
    request.onload = function() {
        if (request.status !== 200) {
            alert(`Ошибка ${request.status}: ${request.statusText}`);
            closeCard(weatherCard);
        } else {
            let answer = request.response;
            if (localStorage.getItem(answer.name) != null && !refreshed) {
                alert(`Ошибка : город "${name}" уже есть в списке`);
                closeCard(weatherCard);
                return;
            }

            weatherCard.querySelector('.card-header h3').innerText = answer.name;
            weatherCard.querySelector('.card-header p').style.visibility = "visible";
            weatherCard.querySelector('.card-header img').style.visibility = "visible";
            weatherCard.querySelector('.card-header p').innerText = Math.round(answer.main.temp) + '\u00B0C';
            weatherCard.querySelector('.card-header img').src = `http://openweathermap.org/img/wn/${answer.weather[0].icon}@2x.png`;
            var closeButton = weatherCard.querySelector(".close-btn");
            closeButton.addEventListener("click", function() {
                closeCard(closeButton);
            }, false);
            updateAllParams(weatherCard, answer);

            if (localStorage.getItem(answer.name) == null) {
                localStorage.setItem(answer.name, "1");
            }
        }
    }
}

function updateAllParams(card, answer) {
    cardParamsList = card.querySelector('.card-param-list');
    addParam(cardParamsList, "Ветер", `${answer.wind.speed} m/s at ${answer.wind.deg}\u00B0`);
    addParam(cardParamsList, "Облачность", `${answer.weather[0].main}`);
    addParam(cardParamsList, "Давление", `${answer.main.pressure} hPa`);
    addParam(cardParamsList, "Влажность", `${answer.main.humidity} %`);
    addParam(cardParamsList, "Координаты", `[${answer.coord.lon} ; ${answer.coord.lat}]`);
}

function addParam(parent, name, value) {
    param = document.getElementById('card-param').content.cloneNode(true);
    param.querySelector('.card-param h4').innerText = name;
    param.querySelector('.card-param p').innerText = value;
    parent.append(param)
}

function closeCard(closeButton) {
    let weatherCard = closeButton.closest(".weather-card");
    let cardIndex = whichChild(weatherCard) - 1;
    console.log("card Index = " + cardIndex);
    if (cardIndex < localStorage.length) {
        localStorage.removeItem(localStorage.key(cardIndex));
    }
    weatherCard.remove();
}

function whichChild(elem) {
    var i = 0;
    while ((elem = elem.previousSibling) != null) ++i;
    return i;
}