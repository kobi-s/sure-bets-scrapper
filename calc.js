// var total = 100
// let bet1 = 2.40
// let draw = 7.00
// let bet2 = 1.91

exports.calc = (betType, oddsFormat, total, bet1, draw, bet2) => {

    if (draw) {
        var stakes = new Array(bet1, draw, bet2);
    } else {
        var stakes = new Array(bet1, bet2);
    }

    var winnings = new Array();

    if (stakes.length) {
        var profit = 0;
        var odd = new Array;
        for (i = 0; i < stakes.length; i++) {
            odd[i] = getDecimalOdds(stakes[i], oddsFormat);
            profit = profit + 1 / odd[i]
        }
        profit = 1 / profit;
        var stake = 0;
        var stakeTotal = 0;
        var minStake = 9999999999;
        var maxStake = 0;
        var stakeArr = new Array();
        var stakeSum = 0;
        for (i = 0; i < stakes.length; i++) {
            stake = getNumber((profit / odd[i]) * total)
            stakeSum += stake * 1;
            if (stakeSum > total || (i == stakes.length - 1 && stakeSum < total)) {
                stake = new Number(total - stakeSum * 1 + stake * 1).toFixed()
            }
            stakeTotal = getNumber(odd[i] * stake);
            stakes[i] = stake;
            winnings.push(stakeTotal)

            if (stakeTotal < minStake) {
                minStake = stakeTotal
            }
            if (stakeTotal > maxStake) {
                maxStake = stakeTotal
            }
            stakeArr[i] = stakeTotal
        }

        return {stakes: stakes, winnings: winnings}
    }
};

function getNumber(number, dec) {
    if (dec == undefined || (dec * 1) == 0) {
        dec = 2
    } else {
        dec = dec * 1
    }
    number = new Number(number);
    return number.toFixed(dec)
};

function getDecimalOdds(odds, oddsFormat) {
    switch (oddsFormat) {
        case 3:
            if (odds > 0) {
                odds = odds / 100 + 1
            } else {
                odds = (100 + Math.abs(odds)) / Math.abs(odds)
            }
            break;
        case 4:
            odds = Math.abs(odds) + 1;
            break;
        case 5:
            if (odds >= 0) {
                odds = Math.abs(odds) + 1
            } else {
                odds = 1 / Math.abs(odds) + 1
            }
            break;
        case 6:
            if (odds >= 0) {
                odds = Math.abs(odds) + 1
            } else {
                odds = 1 / Math.abs(odds) + 1
            }
            break
    }
    return String(odds)
};


// calc(1, 1)