'use strict';

const fetch = require('node-fetch');

const BASE_URL = 'http://castles.poulpi.fr/castles/1/rooms/';
const init = 'entry';
const myHistorical = { };
let successChest = [ ];

/**
 * Get the json from multiple rooms in urlTab
 * @param urlTab
 * @param roomsResponse
 */
const checkRooms = async (urlTab, roomsResponse = []) => {
    if(urlTab.length === 0) return roomsResponse;
      try {
          const response = await fetch(BASE_URL+urlTab[0]);
          const json = await response.json();
          roomsResponse.push(json);
          urlTab.shift();
      } catch (error) {
        console.log(error);
      }
    return checkRooms(urlTab, roomsResponse);
};

/**
 * Verity if chests are empty or not & fill successChest
 * @param urlTab
 * @param callback
 */
const checkChests = async (urlTab, callback) => {
  if(urlTab.length === 0) return callback;
  try {
      const response = await fetch(BASE_URL + urlTab[0]);
      const json = await response.json();
      if (json.status !== 'This chest is empty :/ Try another one!') successChest.push(json.id);
      urlTab.shift();
  } catch (error) {
    console.log(error);
  }
  return checkChests(urlTab, callback);
};

/**
 * Main loop over every room
 * @param urlTab
 */
const castleLoop = (urlTab, callback) => {
  // filter URL to keep the unvisited ones
  // ~ = BITWISE NOT OPERATOR, reverse every bit => indexOf === -1 become 0 so falsy
  const filteredUrlTab = urlTab.filter(url => !~Object.keys(myHistorical).indexOf(url));

  // Return if only visited rooms
  if (filteredUrlTab.length === 0) return callback;

  // Table of rooms content
  const endPointResponses = checkRooms(filteredUrlTab);

  // Table of chests url
  const multipleChestsUrls = endPointResponses.map(endPointResponse => endPointResponses.chests);
  checkChests(multipleChestsUrls);

  // Fill historical
  urlTab.forEach( url => {
    myHistorical[url] = 1
  });

  // Table of rooms url
  const multipleNewsRoomsUrls = endPointResponses.map(endPointResponse => endPointResponse.rooms);

  //Loop over new rooms
  multipleNewsRoomsUrls.forEach( roomsTab => {
     return castleLoop(roomsTab);
  });
};

castleLoop([init]);
console.log(successChest);