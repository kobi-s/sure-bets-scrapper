const puppeteer = require('puppeteer');
const stakesCalculator = require('./calc')
const fs = require('fs')
const log = require('./logger')
const request = require('request')
const last10gamesFile = "./last10games.json"
const currents10gamesFile = "./current10games.json"
const uuidv1 = require('uuid/v1');

const oddsportal_url = "https://www.oddsportal.com/sure-bets/"
const SERVER_ADDRESS = "http://79.177.33.128:8080/placeBet";


let openBrowser = async () => {
    let gamesData;
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process'
        ]
    });
    const page = await browser.newPage();
    await page.goto(oddsportal_url, { waitUntil: 'domcontentloaded' });
    await page.waitFor(1000);

    let games = await page.evaluate(() => {

        let participant = Array.from(document.querySelectorAll('#sure-bets-result .table-main tr.odd'))

        return participant.map(tr => {
            return {
                url: tr.querySelector('a').href,
                title: tr.querySelector('a').textContent,
                time: tr.querySelector('td.table-time.datet').textContent,
                odds: Array.from(tr.querySelectorAll('div.odds-nowrp')).map(a => a.textContent),
                sites: Array.from(tr.querySelectorAll('a')).map(a => a.getAttribute('title')).filter((el) => { return el != null }),
                profit: parseFloat(tr.querySelector('td.center.bold').textContent.replace('%', ''))

                // TODO: total + O/U
            }
        })
    });
    gamesData = games
    await browser.close();
    return gamesData;
}

function addStakes(gameObject) {
    let stakes;
    // Over	Under Game
    if (gameObject.odds.length === 2) {
        stakes = stakesCalculator.calc(2, 1, 100, gameObject.odds[0], null, gameObject.odds[1])
        gameObject.stakes = stakes.stakes
        gameObject.winnings = stakes.winnings

    } else {
        // 1	X	2 Game
        stakes = stakesCalculator.calc(1, 1, 100, gameObject.odds[0], gameObject.odds[1], gameObject.odds[2])
        gameObject.stakes = stakes.stakes
        gameObject.winnings = stakes.winnings
    }
    gameObject.uid = uuidv1()
    return gameObject;
}

function readLast10Games(file, callback) {
    fs.readFile(file, function (err, content) {
        if (err) return callback(err)
        callback(null, JSON.parse(content))
    })
}

function saveNew10GamesToFile(json) {
    fs.writeFile(last10gamesFile, json, 'utf8', (err, data) => {
        if (err) {
            console.log(err)
        }
    })
}

function compeareLastGames(newGamesArray) {
    readLast10Games(last10gamesFile, (err, lastgames) => {
        if (lastgames) {
            newGamesArray.forEach(a => {
                if (!lastgames.some(game => game.url === a.url)) {
                    sendToServerNewGames(JSON.stringify(a))
                    saveNew10GamesToFile(JSON.stringify(newGamesArray))
                }
            })
        }
    })
}

function sendToServerNewGames(game) {
    fs.appendFile('fakeserver.json', game, 'utf8', (err, data) => {
        if (err) {
            console.log(err)
        }
    })
    request.post(SERVER_ADDRESS, { headers: { 'Content-type': 'application/json; charset=utf-8' }, body: game }, (err, result) => {
        if (err) {
            console.log(err)
        }
        else {
            log.info('new game send to server');
        }
    })
}


exports.start = async function (interval) {
    log.info('[+] Scrapper started')
    setInterval(() => {
        openBrowser()
            .then(results => {
                let rowGames = []
                results.forEach(game => {
                    rowGames.push(addStakes(game))
                })
                compeareLastGames(rowGames)

                fs.writeFile(currents10gamesFile, JSON.stringify(rowGames), 'utf8', (err, data) => {
                    if (err) {
                        console.log(err)
                    }
                })
            })
            .catch(console.log)
    }, interval)
}
