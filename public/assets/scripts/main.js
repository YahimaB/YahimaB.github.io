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

    fetch('http://localhost:3000/favourites', { method: 'GET' })
        .then(response => {
            if (response.status != 200) {
                alert(`Error ${response.status}: ${response.statusText}`);
            } else {
                response.json()
                    .then(data => {
                        for (let i = 0; i < data.length; i++) {
                            console.log(data[i]);
                            addFavouriteCity(data[i].name, true);
                        }
                    })
            }
        })
        .catch(err => alert(`Favourite cities - ${err}`));
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

    fetch(`http://localhost:3000/weather/coordinates?lat=${lat}&lon=${lon}`, { method: 'GET' })
        .then(response => {
            if (response.status != 200) {
                alert(`Error ${response.status}: ${response.statusText}`);
            } else {
                response.json()
                    .then(data => setupLocalCard(data))
            }
        })
        .catch(err => {
            alert(`Located city - ${err}`);
            localCards.querySelector('.local-card-header h3').innerHTML = "Error...";
        });
}

function onGeoFailedCallback() {
    fetch(`http://localhost:3000/weather/city?q=saint+petersburg`, { method: 'GET' })
        .then(response => {
            if (response.status != 200) {
                alert(`Error ${response.status}: ${response.statusText}`);
            } else {
                response.json()
                    .then(data => setupLocalCard(data))
            }
        })
        .catch(err => {
            alert(`NotLocated city - ${err}`);
            localCards.querySelector('.local-card-header h3').innerHTML = "Error...";
        });
}

function setupLocalCard(answer) {
    localCards.querySelector('.local-card-header h3').innerHTML = answer.name;
    localCards.querySelector('.local-card-header-content').style.display = "flex";
    localCards.querySelector('.local-card-header-content p').innerHTML = Math.round(answer.main.temp) + '\u00B0C';
    localCards.querySelector('.local-card-header-content img').src = answer.icon;
    updateAllParams(localCards, answer);
}

function onSearchFunction() {
    var searchBar = document.getElementById("city-search");
    var cityName = searchBar.value;
    searchBar.value = null;
    console.log(cityName);

    addFavouriteCity(cityName, false);
}

function addFavouriteCity(name, refreshed) {
    const weatherCard = document.createElement("li");
    weatherCard.classList.add("weather-card");
    weatherCard.append(document.getElementById('weather-card').content.cloneNode(true))
    weatherCard.querySelector('.card-header h3').innerText = "Wait pls...";
    weatherCard.querySelector('.card-header p').style.visibility = "hidden";
    weatherCard.querySelector('.card-header img').style.visibility = "hidden";
    favouriteCardsList.append(weatherCard);


    fetch(`http://localhost:3000/weather/city?q=${name}`, { method: 'GET' })
        .then(weatherResponse => {
            if (weatherResponse.status != 200) {
                alert(`Error ${weatherResponse.status}: ${weatherResponse.statusText}`);
                closeCard(weatherCard);
            } else {
                weatherResponse.json()
                    .then(answer => {
                        if (refreshed) {
                            weatherCard.querySelector('.card-header h3').innerText = answer.name;
                            weatherCard.querySelector('.card-header p').style.visibility = "visible";
                            weatherCard.querySelector('.card-header img').style.visibility = "visible";
                            weatherCard.querySelector('.card-header p').innerText = Math.round(answer.main.temp) + '\u00B0C';
                            weatherCard.querySelector('.card-header img').src = answer.icon;
                            var closeButton = weatherCard.querySelector(".close-btn");
                            closeButton.addEventListener("click", function() {
                                closeCard(closeButton);
                            }, false);
                            updateAllParams(weatherCard, answer);
                        } else {
                            fetch(`http://localhost:3000/favourites?name=${answer.name}`, { method: 'POST' })
                                .then(response => {
                                    if (response.status != 200) {
                                        alert(`Error ${response.status}: ${response.statusText}`);
                                        closeCard(weatherCard);
                                    } else {
                                        weatherCard.querySelector('.card-header h3').innerText = answer.name;
                                        weatherCard.querySelector('.card-header p').style.visibility = "visible";
                                        weatherCard.querySelector('.card-header img').style.visibility = "visible";
                                        weatherCard.querySelector('.card-header p').innerText = Math.round(answer.main.temp) + '\u00B0C';
                                        weatherCard.querySelector('.card-header img').src = answer.icon;
                                        var closeButton = weatherCard.querySelector(".close-btn");
                                        closeButton.addEventListener("click", function() {
                                            closeCard(closeButton);
                                        }, false);
                                        updateAllParams(weatherCard, answer);
                                    }
                                })
                                .catch(err => {
                                    alert(`Add city to DB - ${err}`);
                                    closeCard(weatherCard);
                                })
                        }
                    })
            }
        })
        .catch(err => {
            alert(`Get city weather - ${err}`);
            closeCard(weatherCard);
        });
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
    let cityName = weatherCard.querySelector('.card-header h3').innerText;
    let cardIndex = whichChild(weatherCard) - 1;
    console.log("card Index = " + cardIndex);

    fetch(`http://localhost:3000/favourites?name=${cityName}`, { method: 'DELETE' })
        .then(response => {
            if (response.status != 200) {
                alert(`Error ${response.status}: ${response.statusText}`);
            } else {
                weatherCard.remove();
            }
        })
        .catch(err => alert(`Delete city - ${err}`));
}

function whichChild(elem) {
    var i = 0;
    while ((elem = elem.previousSibling) != null) ++i;
    return i;
}