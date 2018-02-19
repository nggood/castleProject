'use strict';

const fetch = require('node-fetch');

const BASE_URL = 'http://castles.poulpi.fr';
const init = '/castles/1/rooms/entry';
let successChest = [ ];

/**
 * Get the json from multiple rooms in urlTab
 * @param urlTab
 * @return roomsResponse
 */
const checkRooms = async (urlTab, roomsResponse = []) => {

    for (let i = 0 ; i < urlTab.length; i++) {
        try {
            let response = await fetch(BASE_URL+urlTab[i]);
            let json = await response.json();
            roomsResponse.push(json);
        } catch (error) {
            console.log(error);
        }
    }
    return roomsResponse;
};

/**
 * Verity if chests are empty or not & fill successChest
 * @param urlTab
 */
const checkChests = async (urlTab) => {

    for (let i = 0; i < urlTab.length; i++) {
        try {
            const response = await fetch(BASE_URL + urlTab[i]);
            const json = await response.json();
            if (json.status != 'This chest is empty :/ Try another one!') successChest.push(json.id);
        } catch (error) {
            console.log(error);
        }
    }
};

/**
 * Main loop over every room
 * @param urlTab
 */
const castleLoop = async (urlTab) => {
    if (urlTab.length === 0) return 1;


    // Table of rooms content
    await checkRooms(urlTab)
        .then((endPointResponses) => {
                // Table of chests url
                const multipleChestsUrls = endPointResponses.map(endPointResponse => endPointResponse.chests);

                //Reduce table
                const chestsUrls = multipleChestsUrls.reduce((prev, curr) => [...prev, ...curr]);
                checkChests(chestsUrls)
                    .then(() => {
                            // Table of rooms url
                            const multipleNewRoomsUrls = endPointResponses.map(endPointResponse => endPointResponse.rooms);
                            //Reduce table
                            const newRoomsUrls = multipleNewRoomsUrls.reduce((prev, curr) => [...prev, ...curr]);

                            //Loop over new rooms
                            return castleLoop(newRoomsUrls);
                        }
                    )
                    .catch(error => console.log(error))
            }
        );
};

castleLoop([init])
    .then(console.log(successChest))
    .catch(error => console.log(error));