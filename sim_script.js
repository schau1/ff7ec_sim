// python -m http.server

// Files ended up with xxxData.csv are database files that have been processed
// through my local processor (ff7ec.vcxproj) to remove unnecessary info to reduce the file size
// To update the database, update google spreadsheet, save as csv, then run through the local
// processor, and upload the result to the repo.
const WEAP_FILE_NAME = 'weaponData.csv'
const CHAR_FILE_NAME = 'characters.csv'
const GEAR_FILE_NAME = 'gearData.csv'

// don't need this but I just want to make sure my calc is right by checking with game
/*const MY_HW_MATK = 0.159;   //15.4%
const MY_HW_PATK = 0.178;
const MY_HW_HP = 0.113;
const MY_HW_HEAL = 0.051;
const MY_HW_WEP = 0.275
*/

const MY_HW_MATK = 0;
const MY_HW_PATK = 0;
const MY_HW_HP = 0;
const MY_HW_HEAL = 0;
const MY_HW_WEP = 0;

const FILE_NUM_SKIP_LINE = 1;
let userWeapList = [];
let weaponDatabase = [];
var charName = ""; 
let gearList = []; 
let charNameList = [];
var gear, mainHand, offHand, sub1, sub2, sub3;
let simChar = [];
var lastBreak = Date.now();
var stopRunning = true;
var databaseLoaded = false; // set to true once userWeapList has calculated value for OBs and Rs
var lastBarUpdate = Date.now();

readCharDatabase();
readWeaponDatabase();
readGearDatabase();

// -------------- Start of UI function
// These are functions called from HTML
function fillMainHand() {
    if (!stopRunning) {
        alert("Stopping in progress sim.");
        stopRunning = true;
    }

    let dropdown = document.getElementById("MHDiv");
    var firstChild = dropdown.children[0];  // Save the search Filter

    dropdown.textContent = '';
    dropdown.appendChild(firstChild);   //add back the search field

    // if there is a userlist, we use the userlist. If not we use the main database
    if (userWeapList.length == 0) {
        readWeaponDatabase();
        populateUserWeapListUsingDatabase();
    }

    outputCharWeapon(dropdown, userWeapList, charName);
}

function fillOffHand() {
    if (!stopRunning) {
        alert("Stopping in progress sim.");
        stopRunning = true;
    }

    let dropdown = document.getElementById("OHDiv");
    var firstChild = dropdown.children[0];  // Save the search Filter

    dropdown.textContent = '';
    dropdown.appendChild(firstChild);   //add back the search field

    // if there is a userlist, we use the userlist. If not we use the main database
    if (userWeapList.length == 0) {
        readWeaponDatabase();
        populateUserWeapListUsingDatabase();
    }

    outputCharWeapon(dropdown, userWeapList, charName);
}

function fillCharacter() {
    if (!stopRunning) {
        alert("Stopping in progress sim.");
        stopRunning = true;
    }

    let dropdown = document.getElementById("charDiv");
    var firstChild = dropdown.children[0];  // Save the search Filter

    dropdown.textContent = '';
    dropdown.appendChild(firstChild);   //add back the search field

    readCharDatabase();

    outputCharName(dropdown, charNameList);
}

function fillGear() {
    if (!stopRunning) {
        alert("Stopping in progress sim.");
        stopRunning = true;
    }

    let dropdown = document.getElementById("gearDiv");
    var firstChild = dropdown.children[0];

    dropdown.textContent = '';
    dropdown.appendChild(firstChild);

    if (gearList.length == 0) {
       readGearDatabase();
    }

    outputCharGear(dropdown, gearList);
}
function fillSubweapon(elementId) {
    if (!stopRunning) {
        alert("Stopping in progress sim.");
        stopRunning = true;
    }

    let dropdown = document.getElementById(elementId);
    var firstChild = dropdown.children[0];

    dropdown.textContent = '';
    dropdown.appendChild(firstChild);

    // if there is a userlist, we use the userlist. If not we use the main database
    if (userWeapList.length == 0) {
        readWeaponDatabase();
        populateUserWeapListUsingDatabase();
    }

    outputAllCharWeapon(dropdown, userWeapList);
}

function fillSubweapon1() {
    fillSubweapon("sub1Div");
}

function fillSubweapon2() {
    fillSubweapon("sub2Div");
}
function fillSubweapon3() {
    fillSubweapon("sub3Div");
}

function fillBlklist() {
    if (!stopRunning) {
        alert("Stopping in progress sim.");
        stopRunning = true;
    }

    let dropdown = document.getElementById("blklistDiv");
    var firstChild = dropdown.children[0];

    dropdown.textContent = '';
    dropdown.appendChild(firstChild);

    // if there is a userlist, we use the userlist. If not we use the main database
    if (userWeapList.length == 0) {
        readWeaponDatabase();
        populateUserWeapListUsingDatabase();
    }

    outputBlacklistWeaponList(dropdown, userWeapList);
}

function runSimMh() {
    runSim(true);
}

function runSimOh() {
    runSim(false);
}

/* ------------- Sim functions start -------------------*/
function runSim(simMH) {
    const start = Date.now();

    var element = document.getElementById("progressBar");
    element.style.width = "0%";
    element.innerHTML = element.style.width;

    if (validateInput()) {
        stopRunning = false;

        if (!databaseLoaded) {
            databaseLoaded = true;
            calcStatsForCharacterWeaponList();
        }
        initializeSimChar(simChar);

        charSetStatsFromDatabase(simChar);
        gearAddRFromGearToCharR(simChar);

        simBestSub(simChar, simMH).then((res) => {
            damage = FillSubWeaponAndCalcDamage(simChar, simMH);

            outputResult(damage, simChar);

            const ms = Date.now() - start;

            console.log("Sim took " + ms + "ms");
            stopRunning = true;
        });
    }   
}

function pause() {
    return new Promise(resolve => setTimeout(resolve));
}

async function shouldIPause(){
    if (Date.now() - 17 > lastBreak) {

        if (((Date.now() - lastBarUpdate) / 1000) >= 2) {
            // more than 2s has passed
            var element = document.getElementById("progressBar");

            var curr = parseInt(element.innerHTML);

            element.style.width = curr + 1 + "%";
            if (element.style.width != "99%") {
                element.innerHTML = element.style.width;
            }
            lastBarUpdate = Date.now();
        } 

        lastBreak = Date.now();
        await pause();
    }
}
async function simBestSub(character, mainHand) {
    var findSub1 = false;
    var findSub2 = false;
    var findSub3 = false;
    var element;
    var damage = 0;

//    console.log(character);

    if (character.sub1 == "") {
        findSub1 = true;
    }
    if (character.sub2 == "") {
        findSub2 = true;
    }
    if (character.sub3 == "") {
        findSub3 = true;
    }

    if (findSub1) {
        // find Sub1 is empty but we have sub2 or sub3 set
        if (!findSub2) {
            findSub1 = false;
            findSub2 = true;
            character.sub1 = character.sub2;
            character.sub2 = "";
        }
        else if (!findSub3) {
            findSub1 = false;
            findSub3 = true;
            character.sub1 = character.sub3;
            character.sub3 = "";
        }
    }

    if (findSub2 && !findSub3) {
        // find Sub2 is empty but we have sub3 set
        findSub2 = false;
        findSub3 = true;
        character.sub2 = character.sub3;
        character.sub3 = "";
    }

    var count = 0;
    var bestStatMH = character; 
    var bestDmg = 0;
    var sim;

    for (var i = 0; i < userWeapList.length; i++)     {
        await shouldIPause();
        // If we have a main hand or an off hand, we move on
        if ((getValueFromDatabaseItem(userWeapList[i], "name") == character.mh) ||
            (getValueFromDatabaseItem(userWeapList[i], "name") == character.oh)) {
            setValueToDatabaseItem(userWeapList[i], "avail", "N");
            continue;
        }

        if ((getValueFromDatabaseItem(userWeapList[i], "avail") == "N") &&
            (getValueFromDatabaseItem(userWeapList[i], "name") != character.sub1))
            continue;

        // If we already have a sub1 weapon, we will find the weapon in the list and sim only that one
        if (!findSub1 && (getValueFromDatabaseItem(userWeapList[i], "name") != character.sub1))
            continue;

        if (stopRunning) {
            return 0;
        }

        for (var j = 0; j != userWeapList.length; j++)         {
            if ((getValueFromDatabaseItem(userWeapList[j], "avail") == "N") &&
                (getValueFromDatabaseItem(userWeapList[j], "name") != character.sub2))
                continue;

            if ((getValueFromDatabaseItem(userWeapList[j], "name") == getValueFromDatabaseItem(userWeapList[i], "name")) ||
                (getValueFromDatabaseItem(userWeapList[j], "name") == character.mh) ||
                (getValueFromDatabaseItem(userWeapList[j], "name") == character.oh))
                continue;

            // If we already have a sub2 weapon, we will find the weapon in the list and sim only that one
            if (!findSub2 && (getValueFromDatabaseItem(userWeapList[j], "name") != character.sub2))
                continue;

            for (var z = 0; z != userWeapList.length; z++)             {
                if ((getValueFromDatabaseItem(userWeapList[z], "name") == getValueFromDatabaseItem(userWeapList[j], "name")) ||
                    (getValueFromDatabaseItem(userWeapList[z], "name") == getValueFromDatabaseItem(userWeapList[i], "name")) ||
                    (getValueFromDatabaseItem(userWeapList[z], "name") == character.mh) ||
                    (getValueFromDatabaseItem(userWeapList[z], "name") == character.oh))
                    continue;

                if (getValueFromDatabaseItem(userWeapList[z], "avail") == "N")
                    continue;

                // WTF are we doing if we're not looking for any weapon
                if (!findSub3)
                    continue;

                sim = { ...character }; 
                sim.sub1 = getValueFromDatabaseItem(userWeapList[i], "name");
                sim.sub2 = getValueFromDatabaseItem(userWeapList[j], "name");
                sim.sub3 = getValueFromDatabaseItem(userWeapList[z], "name");

                var damage = FillSubWeaponAndCalcDamage(sim, mainHand);

                if (damage == 0) {
                    return 0;
                }

                if (damage > bestDmg) {
                    bestStatMH = sim;
                    bestDmg = damage;
//                    console.log(damage);
                }

                count++;
            }
        }

    }

    console.log("Total number of loop: " + count);

    character.sub1 = bestStatMH.sub1;
    character.sub2 = bestStatMH.sub2;
    character.sub3 = bestStatMH.sub3;

    return bestDmg;
}

function FillSubWeaponAndCalcDamage(character, simMH) {
    // Finish filling all the character weapons and stats from user.
    weapAddWeaponStatstoCharStat(character);
    calcTotalStatFromCharR(character);

    var type, pot, element;
    var damage = 0;

    if (simMH) {
        type = character.mhType;
        pot = character.mhPot;
        element = character.mhElem;
    }
    else {
        type = character.ohType;
        pot = character.ohPot;
        element = character.ohElem;
    }

    character.boostAbilityPercent += calculateAbilityPotPercent(character.boostAbility);
    character.boostPabilityPercent += calculateAbilityPMPotPercent(character.boostPability);
    character.boostMabilityPercent += calculateAbilityPMPotPercent(character.boostMability);
    character.boostElementalPot = convertElementalXPotencyToElementalPotency(character, element);

    if (element == "Heal") {
        damage = 0;
    }
    else if (type == "Mag.") {
        damage = calculateSkillDamage(character.matk, character.boostMabilityPercent, character.boostElementalPot, character.boostAbilityPercent, pot, MY_HW_WEP, ENEMY_DEFENSE);
    }
    else {
        damage = calculateSkillDamage(character.patk, character.boostPabilityPercent, character.boostElementalPot, character.boostAbilityPercent, pot, MY_HW_WEP, ENEMY_DEFENSE);
    }

    return damage;
}

/* ------------- Sim functions end -------------------*/
function outputResult(damage, character) {
    var element = document.getElementById("progressBar");
    element.style.width = "100%";
    element.innerHTML = "100%";

    element = document.getElementById("result");

    element.innerHTML = "";

    var item = document.createElement("p");
    item.innerHTML = "Damage is: ~" + damage;
    element.appendChild(item);

    item = document.createElement("p");
    item.innerHTML = "Name: " + character.name;
    element.appendChild(item);

    item = document.createElement("p");
    item.innerHTML = "Stats (approximate value. Could be off by a few points due to rounding method): ";
    element.appendChild(item);

    var ul = document.createElement("ul");
    item = document.createElement("li");
    item.innerHTML = "  HP: " + character.hp;
    ul.appendChild(item);
    item = document.createElement("li");
    item.innerHTML = "  PATK: " + character.patk;
    ul.appendChild(item);
    item = document.createElement("li");
    item.innerHTML = "  MATK: " + character.matk;
    ul.appendChild(item);
    /*    item = document.createElement("li");
        item.innerHTML = "  HEAL: " + character.heal;
        ul.appendChild(item);*/
    element.appendChild(ul);

    item = document.createElement("p");
    item.innerHTML = "Best Equipment: ";
    element.appendChild(item);

    ul = document.createElement("ul");

    item = document.createElement("li");
    item.innerHTML = "  Main hand: " + character.mh;
    ul.appendChild(item);

    item = document.createElement("li");
    item.innerHTML = "  Off hand: " + character.oh;
    ul.appendChild(item);

    item = document.createElement("li");
    item.innerHTML = "  Subweapon: " + character.sub1;
    ul.appendChild(item);

    item = document.createElement("li");
    item.innerHTML = "  Subweapon: " + character.sub2;
    ul.appendChild(item);

    item = document.createElement("li");
    item.innerHTML = "  Subweapon: " + character.sub3;
    ul.appendChild(item);

    element.appendChild(ul);

    item = document.createElement("p");
    item.innerHTML = "R Abilities: ";
    element.appendChild(item);

    ul = document.createElement("ul");

    if (character.boostHp > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost HP: " + character.boostHp;
        ul.appendChild(item);
    }

    if (character.boostHpPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost HP (%): " + character.boostHpPercent * 100 + "%";
        ul.appendChild(item);
    }

    if (character.boostPatk > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost PATK: " + character.boostPatk;
        ul.appendChild(item);
    }

    if (character.boostPatkPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost PATK (%): " + character.boostPatkPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostMatk > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost MATK: " + character.boostMatk;
        ul.appendChild(item);
    }
    if (character.boostMatkPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost MATK (%): " + character.boostMatkPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostAtk > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost ATK: " + character.boostAtk;
        ul.appendChild(item);
    }
    if (character.boostAtkPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost ATK (%): " + character.boostAtkPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostHeal > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost HEAL: " + character.boostHeal;
        ul.appendChild(item);
    }
    if (character.boostHealPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost HEAL (%): " + character.boostHealPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostCrit > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Crit. Pot.: " + character.boostCrit;
        ul.appendChild(item);
    }
    if (character.boostCritPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Crit. Pot. (%): " + character.boostCritPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostFirePot > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Fire Pot.: " + character.boostFirePot;
        ul.appendChild(item);
    }
    if (character.boostFirePotPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Fire Pot. (%): " + character.boostFirePotPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostIcePot > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Ice Pot.: " + character.boostIcePot;
        ul.appendChild(item);
    }
    if (character.boostIcePotPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Ice Pot. (%): " + character.boostIcePotPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostThunderPot > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Lightning Pot.: " + character.boostThunderPot;
        ul.appendChild(item);
    }
    if (character.boostThunderPotPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Lightning Pot.(%): " + character.boostThunderPotPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostWaterPot > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Water Pot.: " + character.boostWaterPot;
        ul.appendChild(item);
    }
    if (character.boostWaterPotPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Water Pot. (%): " + character.boostWaterPotPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostWindPot > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Wind Pot.: " + character.boostWindPot;
        ul.appendChild(item);
    }
    if (character.boostWindPotPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Wind Pot. (%): " + character.boostWindPotPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostEarthPot > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Earth Pot.: " + character.boostEarthPot;
        ul.appendChild(item);
    }
    if (character.boostEarthPotPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Earth Pot. (%): " + character.boostEarthPotPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostPability > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Phys. Ability Pot.: " + character.boostPability;
        ul.appendChild(item);
    }
    if (character.boostPabilityPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Phys. Ability Pot. (%): " + character.boostPabilityPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostMability > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Mag. Ability Pot.: " + character.boostMability;
        ul.appendChild(item);
    }
    if (character.boostMabilityPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Mag. Ability Pot. (%): " + character.boostMabilityPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostAbility > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Ability Pot.: " + character.boostAbility;
        ul.appendChild(item);
    }
    if (character.boostAbilityPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Ability Pot.(%): " + character.boostAbilityPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostPdef > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost PDEF: " + character.boostPdef;
        ul.appendChild(item);
    }
    if (character.boostMdef > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost MDEF: " + character.boostMdef;
        ul.appendChild(item);
    }
    if (character.boostDebuffExt > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Debuff Extension: " + character.boostDebuffExt;
        ul.appendChild(item);
    }
    if (character.boostBuffDebuffExt > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Buff/Debuff Extension: " + character.boostBuffDebuffExt;
        ul.appendChild(item);
    }
    if (character.boostPatkAll > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost PATK (All): " + character.boostPatkAll;
        ul.appendChild(item);
    }
    if (character.boostMatkAll > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost MATK (All): " + character.boostMatkAll;
        ul.appendChild(item);
    }

    element.appendChild(ul);

}

function weapAddWeaponStatstoCharStat(character) {
    var foundMh = false, foundOh = false, foundSub1 = false, foundSub2 = false, foundSub3 = false;

    if (character.mainHand == "") { foundMh = true; }
    if (character.offHand == "") { foundOh = true; }
    if (character.sub1 == "") { foundSub1 = true; }
    if (character.sub2 == "") { foundSub2 = true; }
    if (character.sub3 == "") { foundSub3 = true; }
        
    for (var i = 0; i < userWeapList.length; i++) {
        var name = getValueFromDatabaseItem(userWeapList[i], "name");

        if (!foundMh && (character.mh == name)) {
            addWeapontoCharStat(character, userWeapList[i], true);
            character.mhPot = userWeapList[i].pot;
            character.mhElem = userWeapList[i].element;
            character.mhType = userWeapList[i].type;
            foundMH = true;
        }
        else if (!foundOh && (character.oh == name)) {
            addWeapontoCharStat(character, userWeapList[i], false);
            character.ohPot = userWeapList[i].pot;
            character.ohElem = userWeapList[i].element;
            character.ohType = userWeapList[i].type;
            foundOh = true;
        }
        else if (!foundSub1 && (character.sub1 == name)) {
            addWeapontoCharStat(character, userWeapList[i], false);
            foundSub1 = true;
        }
        else if (!foundSub2 && (character.sub2 == name)) {
            addWeapontoCharStat(character, userWeapList[i], false);
            foundSub2 = true;
        }
        else if (!foundSub3 && (character.sub3 == name)) {
            addWeapontoCharStat(character, userWeapList[i], false);
            foundSub3 = true;
        }

        if (foundMh && foundOh && foundSub1 && foundSub2 && foundSub3) {
            return;
        }
    }
}

function initializeSimChar(character) {
    character.name = charName;
    character.mh = mainHand;
    character.mhType = "";
    character.mhElem = "";
    character.oh = offHand;
    character.ohType = "";
    character.ohElem = "";
    character.sub1 = sub1;
    character.sub2 = sub2;
    character.sub3 = sub3;
    character.gear = gear;
    character.boostHp = 0;
    character.boostHpPercent = 0;
    character.boostPatk = 0;
    character.boostPatkPercent = 0;
    character.boostMatk = 0;
    character.boostMatkPercent = 0;
    character.boostAtk = 0;
    character.boostAtkPercent = 0;
    character.boostHeal = 0;
    character.boostHealPercent = 0;
    character.boostCrit = 0;
    character.boostCritPercent = 0;
    character.boostFirePot = 0;
    character.boostFirePotPercent = 0;
    character.boostIcePot = 0;
    character.boostIcePotPercent = 0;
    character.boostThunderPot = 0;
    character.boostThunderPotPercent = 0;
    character.boostWaterPot = 0;
    character.boostWaterPotPercent = 0;
    character.boostWindPot = 0;
    character.boostWindPotPercent = 0;
    character.boostEarthPot = 0;
    character.boostEarthPotPercent = 0;
    character.boostPability = 0;
    character.boostPabilityPercent = 0;
    character.boostMability = 0;
    character.boostMabilityPercent = 0;
    character.boostAbility = 0;
    character.boostAbilityPercent = 0;
    character.boostPdef = 0;
    character.boostMdef = 0;
    character.boostDebuffExt = 0;
    character.boostBuffDebuffExt = 0;
    character.boostPatkAll = 0;
    character.boostMatkAll = 0;
    character.boostAtkAll = 0;
}

function charSetStatsFromDatabase(simChar) {
    charNameList.forEach(function (char) {
        if (getValueFromDatabaseItem(char, "name") == simChar.name) {
            simChar.hp = parseInt(getValueFromDatabaseItem(char, "hp"));
            simChar.patk = parseInt(getValueFromDatabaseItem(char, "patk"));
            simChar.matk = parseInt(getValueFromDatabaseItem(char, "matk"));
            simChar.heal = parseInt(getValueFromDatabaseItem(char, "heal"));            
            return;
        }
    });
}

function gearAddRFromGearToCharR(char) {

    gearList.forEach(function (gear) {
        if (getValueFromDatabaseItem(gear, "name") == char.gear) {

            var rValue = parseInt(getValueFromDatabaseItem(gear, "r1value"));
            if (rValue > 0) {
                AddRFromGearToCharR(char, getValueFromDatabaseItem(gear, "r1"), rValue, true);
            }

            rValue = parseInt(getValueFromDatabaseItem(gear, "r2value"));
            if (rValue > 0) {
                AddRFromGearToCharR(char, getValueFromDatabaseItem(gear, "r2"), rValue, true);
            }

            rValue = parseInt(getValueFromDatabaseItem(gear, "r3value"));
            if (rValue > 0) {
                AddRFromGearToCharR(char, getValueFromDatabaseItem(gear, "r3"), rValue, true);
            }

            rValue = parseInt(getValueFromDatabaseItem(gear, "r4value"));
            if (rValue > 0) {
                AddRFromGearToCharR(char, getValueFromDatabaseItem(gear, "r4"), rValue, true);
            }
            return;
        }
    });
}

function calcStatsForCharacterWeaponList() {
    userWeapList.forEach(function (weap) {
        calcStatBaseOnLevelAndOb(weap);
    });

//    console.log(userWeapList);
}

function validateInput() {
    mainHand = document.getElementById("mainHandButton").innerHTML;
    offHand = document.getElementById("offHandButton").innerHTML;
    sub1 = document.getElementById("sub1Button").innerHTML;
    sub2 = document.getElementById("sub2Button").innerHTML;
    sub3 = document.getElementById("sub3Button").innerHTML;

    // Validate the data
    if (!weaponIsFoundInUserList(mainHand)) {
        mainHand = "";
    }

    if (!weaponIsFoundInUserList(offHand)) {
        offHand = "";
    }

    if (mainHand == "") {
        var item = document.getElementById("output");
        item.setAttribute("class", "w3-text-red w3-center");
        item.innerHTML = "Failed to continue. Please select a main hand weapon."
        return false;
    }
    else if (offHand == "") {
        var item = document.getElementById("output");
        item.innerHTML = "Failed to continue. Please select an off hand weapon."
        item.setAttribute("class", "w3-text-red w3-center");
        return false;
    }
    else {
        document.getElementById("output").innerHTML = "";
    }

    if (!weaponIsFoundInUserList(sub1)) {
        sub1 = "";
    }

    if (!weaponIsFoundInUserList(sub2)) {
        sub2 = "";
    }

    if (!weaponIsFoundInUserList(sub3)) {
        sub3 = "";
    }

    if (!gearIsFoundInGearList(gear)) {
        gear = "";
    }
    
    // For testing
/*    mainHand = "Orthodox Raven";
    offHand = "Absolute Royal"
    sub1 = "Sun Umbrella";
    sub2 = "Protector's Blade";
    sub3 = "Enemy Launcher";
    gear = "Intellectual P0 SOLDIER";*/

    return true;
}

function printWeapStat(weap) {

    var name = getValueFromDatabaseItem(weap, "name");
    userWeapList.forEach(function (elem) {
        if (name == getValueFromDatabaseItem(elem, "name")) {
            console.log("Name: " + name);
            console.log("   Pot: " + elem.pot);
            console.log("   HP: " + elem.hp);
            console.log("   PATK: " + elem.patk)
            console.log("   MATK: " + elem.matk);
            console.log("   HEAL: " + elem.heal);
            return;
        }
    });
}

function resetFunc() {
    document.getElementById("characterButton").innerHTML = "Character";
    charName = "";

    document.getElementById("output").innerHTML = "";    

    document.getElementById("result").innerHTML = "";

    var divParent = document.getElementById("blklistList");
    while (divParent.firstChild) {
        weaponSearchAndMarkAvailable(divParent.lastChild.innerHTML, "Y");
        divParent.removeChild(divParent.lastChild);
    }

    resetWeaponSelection();

    stopRunning = true;
}

function resetWeaponSelection() {
    var input = document.getElementById("mainHandButton");
    weaponSearchAndMarkAvailable(input.innerHTML, "Y");
    input.innerHTML = "Main Hand";
    mainHand = "";

    input = document.getElementById("offHandButton");
    weaponSearchAndMarkAvailable(input.innerHTML, "Y");
    input.innerHTML = "Off Hand";
    offHand = "";

    input = document.getElementById("sub1Button");
    weaponSearchAndMarkAvailable(input.innerHTML, "Y");
    input.innerHTML = "Subweapon";
    sub1 = "";

    input = document.getElementById("sub2Button");
    weaponSearchAndMarkAvailable(input.innerHTML, "Y");
    input.innerHTML = "Subweapon";
    sub2 = "";

    input = document.getElementById("sub3Button");
    weaponSearchAndMarkAvailable(input.innerHTML, "Y");
    input.innerHTML = "Subweapon";
    sub3 = "";

    input = document.getElementById("gearButton");
    input.innerHTML = "Gear";
    sub3 = "";

    var element = document.getElementById("progressBar");
    element.style.width = "0%";
    element.innerHTML = "0%";
}

function filterFunctionMH() {
    filterFunction("userFilterMH", "MHDiv", "a");
}

function filterFunctionChar() {
    filterFunction("userFilterChar", "charDiv", "a");
}

function filterFunctionOH() {
    filterFunction("userFilterOH", "OHDiv", "a");
}

function filterFunctionSub1() {
    filterFunction("userFilterSub1", "sub1Div", "a");
}

function filterFunctionSub2() {
    filterFunction("userFilterSub2", "sub2Div", "a");
}

function filterFunctionSub3() {
    filterFunction("userFilterSub3", "sub3Div", "a");
}
function filterFunctionGear() {
    filterFunction("userFilterGear", "gearDiv", "a");
}

function filterFunctionBlklist() {
    filterFunction("userFilterBlklist", "blklistDiv", "a");
}

// -------------- End of UI function

function outputCharGear(dropdown, list) {
    for (var i = 0; i < list.length; i++) {
        if (getValueFromDatabaseItem(list[i], "charName") == charName){
            var item = document.createElement("a");
            item.setAttribute('class', 'w3-bar-item w3-button');
            item.innerHTML = getValueFromDatabaseItem(list[i], "name");
            item.onclick = function () {
                replaceHeaderWithGearName(this);
            };

            dropdown.appendChild(item);
        }
    }
}

function outputCharName(dropdown, nameList) {
    for (var i = 0; i < nameList.length; i++) {
        var item = document.createElement("a");
        item.setAttribute('class', 'w3-bar-item w3-button');
        item.innerHTML = getValueFromDatabaseItem(nameList[i], "name");
        item.onclick = function () {
            replaceHeaderWithCharName(this);
            resetWeaponSelection();
        };

        dropdown.appendChild(item);
    }
}

// Output the item in the itemList in the dropdown if the 
// name matched the passed in name
function outputCharWeapon(dropdown, itemList, charName) {
    for (var i = 0; i < itemList.length; i++) {
        if ((getValueFromDatabaseItem(itemList[i], "charName") == charName) &&
            (getValueFromDatabaseItem(itemList[i], "avail") != "N")) {
            var item = document.createElement("a");
            item.setAttribute('class', 'w3-bar-item w3-button');
            item.innerHTML = getValueFromDatabaseItem(itemList[i], "name");
            item.onclick = function () {
                replaceHeaderWithWeaponName(this);
            };

            dropdown.appendChild(item);
        }
    }
}

function outputAllCharWeapon(dropdown, itemList) {
    for (var i = 0; i < itemList.length; i++) {
        if ((getValueFromDatabaseItem(itemList[i], "avail") != "N")) {
            var item = document.createElement("a");
            item.setAttribute('class', 'w3-bar-item w3-button');
            item.innerHTML = getValueFromDatabaseItem(itemList[i], "name");
            item.onclick = function () {
                replaceHeaderWithWeaponName(this);
            };

            dropdown.appendChild(item);
        }
    }
}

function outputBlacklistWeaponList(dropdown, itemList) {
    for (var i = 0; i < itemList.length; i++) {
        if ((getValueFromDatabaseItem(itemList[i], "avail") != "N")) {
            var item = document.createElement("a");
            item.setAttribute('class', 'w3-bar-item w3-button');
            item.innerHTML = getValueFromDatabaseItem(itemList[i], "name");
            item.onclick = function () {
                addItemToBlackList(this);
            };

            dropdown.appendChild(item);
        }
    }
}

/*----------------- Utils -----------------------*/
// Set the value to avail
function weaponSearchAndMarkAvailable(name, avail) {
    for (var i = 0; i < userWeapList.length; i++) {
        if (getValueFromDatabaseItem(userWeapList[i], "name") == name) {
            setValueToDatabaseItem(userWeapList[i], "avail", avail);
        }
    }
}
function weaponIsFoundInUserList(name) {
    for (var i = 0; i < userWeapList.length; i++) {
        if (getValueFromDatabaseItem(userWeapList[i], "name") == name) {
            return true;
        }
    }
    return false;
}
function gearIsFoundInGearList(name) {
    for (var i = 0; i < gearList.length; i++) {
        if (getValueFromDatabaseItem(gearList[i], "name") == name) {
            return true;
        }
    }
    return false;
}

function replaceHeaderWithCharName(cell) {
    var divParent = cell.parentNode.parentNode;

    charName = cell.innerHTML;
    divParent.children[0].innerHTML = cell.innerHTML;

}
function replaceHeaderWithGearName(cell) {
    var divParent = cell.parentNode.parentNode;

    gear = cell.innerHTML;
    divParent.children[0].innerHTML = cell.innerHTML;
}

function addItemToBlackList(cell){
    var output = document.getElementById("blklistList");

    weaponSearchAndMarkAvailable(cell.innerHTML, "N");

    var el = document.getElementById("blklistDiv").firstChild;

    while (el) {
        if (el.innerHTML == cell.innerHTML) {
            document.getElementById("blklistDiv").removeChild(el);
            break;
        }
        el = el.nextSibling;
    }

    var item = document.createElement("ul");
    item.innerHTML = cell.innerHTML;
    item.onclick = function () {
        removeItemFromBlackList(this);
    };

    output.appendChild(item);
}

function removeItemFromBlackList(cell) {
    var divParent = document.getElementById("blklistList");

    var el = divParent.firstChild;

    while (el) {
        if (el.innerHTML == cell.innerHTML) {
            divParent.removeChild(el);
            break;
        }
        el = el.nextSibling;
    }

    weaponSearchAndMarkAvailable(cell.innerHTML, "Y");
}

function replaceHeaderWithWeaponName(cell) {
    var divParent = cell.parentNode.parentNode;

    weaponSearchAndMarkAvailable(divParent.children[0].innerHTML, "Y");
    weaponSearchAndMarkAvailable(cell.innerHTML, "N");

    divParent.children[0].innerHTML = cell.innerHTML;
}
function printArray(array, charName) {
    for (var i = 0; i < array.length; i++) {
        //console.log(array[i]);
        if (getValueFromDatabaseItem(array[i], "charName") == charName) {
            console.log(array[i]);
        }
    }
}


// Process the file the user entered and fill the userWeapList
function processUserData(text) {
    var lines = text.split('\n');

    var header = CSVToArray(lines[0], ',');

    if (header[0].length != 6) {
        alert("Wrong file format. Please enter a correct file.");
        return false;
    }

    userWeapList = [];

    for (var line = 1; line < lines.length; line++) {

        var row = CSVToArray(lines[line], ',');
        var i = 0;
        let weapData = [];
        weapData.push({ name: 'name', value: row[i][0] });
        weapData.push({ name: 'charName', value: row[i][1] });
        weapData.push({ name: 'level', value: row[i][2] });
        weapData.push({ name: 'ob', value: row[i][3] });
        weapData.push({ name: 'extraOb', value: row[i][4] });
        weapData.push({ name: 'avail', value: row[i][5] }); // avail to sim

        userWeapList.push(weapData);
    }

    //    printArray(userWeapList);
}

function populateUserWeapListUsingDatabase() {
    for (var i = 0; i < weaponDatabase.length; i++) {
        let weapData = [];
        weapData.push({ name: 'name', value: getValueFromDatabaseItem(weaponDatabase[i], "name") });
        weapData.push({ name: 'charName', value: getValueFromDatabaseItem(weaponDatabase[i], "charName") });
        weapData.push({ name: 'level', value: '110' });
        weapData.push({ name: 'ob', value: '10' });
        weapData.push({ name: 'extraOb', value: '' });
        weapData.push({ name: 'avail', value: '' }); // avail to sim

        userWeapList.push(weapData);
    }
}
// ------------------ Database related
function readGearDatabase() {
    if (gearList[0] != null) {
        return;
    }

    var location = window.location.href;
    var directoryPath = location.substring(0, location.lastIndexOf("/") + 1);

    result = loadFile(directoryPath+GEAR_FILE_NAME);

    if (result != null) {
        // By lines
        var lines = result.split('\n');

        for (var line = FILE_NUM_SKIP_LINE; line < lines.length-1; line++) {
            var row = CSVToArray(lines[line], ',');
            var i = 0;
            let data = [];
            data.push({ name: 'name', value: row[i][0] });
            data.push({ name: 'charName', value: row[i][1] });
            data.push({ name: 'r1', value: row[i][2] });
            data.push({ name: 'r1value', value: row[i][3] });
            data.push({ name: 'r2', value: row[i][4] });
            data.push({ name: 'r2value', value: row[i][5] });
            data.push({ name: 'r3', value: row[i][6] });
            data.push({ name: 'r3value', value: row[i][7] });
            data.push({ name: 'r4', value: row[i][8] });
            data.push({ name: 'r4value', value: row[i][9] });
            gearList.push(data);
        }
    }
}

function readCharDatabase() {
    if (charNameList[0] != null) {
        return;
    }

    var location = window.location.href;
    var directoryPath = location.substring(0, location.lastIndexOf("/") + 1);

    result = loadFile(directoryPath+CHAR_FILE_NAME);

    if (result != null) {
        // By lines
        var lines = result.split('\n');

        for (var line = FILE_NUM_SKIP_LINE; line < lines.length; line++) {

            var row = CSVToArray(lines[line], ',');
            var i = 0;
            let data = [];
            data.push({ name: 'name', value: row[i][0] });
            data.push({ name: 'hp', value: row[i][1] });
            data.push({ name: 'patk', value: row[i][2] });
            data.push({ name: 'matk', value: row[i][3] });
            data.push({ name: 'pdef', value: row[i][4] });   
            data.push({ name: 'mdef', value: row[i][5] });
            data.push({ name: 'heal', value: row[i][6] });
            charNameList.push(data);
        }
    }
}

function readWeaponDatabase() {
    if (weaponDatabase[0] != null) {
        return;
    }

    var location = window.location.href;
    var directoryPath = location.substring(0, location.lastIndexOf("/") + 1);

    result = loadFile(directoryPath+WEAP_FILE_NAME);

    if (result != null) {
        // By lines
        var lines = result.split('\n');

        for (var line = FILE_NUM_SKIP_LINE; line < lines.length - 1; line++) {

            var row = CSVToArray(lines[line], ',');
            var i = 0;
            let weapData = [];
            weapData.push({ name: 'name', value: row[i][0] });
            weapData.push({ name: 'charName', value: row[i][1] });
            weapData.push({ name: 'sigil', value: row[i][2] });
            weapData.push({ name: 'atb', value: row[i][3] });
            weapData.push({ name: 'type', value: row[i][4] });    // dmg type
            weapData.push({ name: 'element', value: row[i][5] });
            weapData.push({ name: 'range', value: row[i][6] });
            weapData.push({ name: 'effect1Target', value: row[i][7] });
            weapData.push({ name: 'effect1', value: row[i][8] });
            weapData.push({ name: 'effect1Pot', value: row[i][9] });
            weapData.push({ name: 'effect1MaxPot', value: row[i][10] });
            weapData.push({ name: 'effect2Target', value: row[i][11] });
            weapData.push({ name: 'effect2', value: row[i][12] });
            weapData.push({ name: 'effect2Pot', value: row[i][13] });
            weapData.push({ name: 'effect2MaxPot', value: row[i][14] });
            weapData.push({ name: 'support1', value: row[i][15] });
            weapData.push({ name: 'support2', value: row[i][16] });
            weapData.push({ name: 'support3', value: row[i][17] });
            weapData.push({ name: 'rAbility1', value: row[i][18] });
            weapData.push({ name: 'rAbility2', value: row[i][19] });
            weapData.push({ name: 'potOb10', value: row[i][20] });
            weapData.push({ name: 'maxPotOb10', value: row[i][21] });
            weapData.push({ name: 'effect1Dur', value: row[i][22] });
            weapData.push({ name: 'effect2Dur', value: row[i][23] });
            weapData.push({ name: 'condition1', value: row[i][24] });
            weapData.push({ name: 'condition2', value: row[i][25] });
            weapData.push({ name: 'potOb0', value: row[i][26] });
            weapData.push({ name: 'potOb1', value: row[i][27] });
            weapData.push({ name: 'potOb6', value: row[i][28] });
            weapData.push({ name: 'patkLvl1', value: row[i][29] });
            weapData.push({ name: 'patk', value: row[i][30] });
            weapData.push({ name: 'matkLvl1', value: row[i][31] });
            weapData.push({ name: 'matk', value: row[i][32] });
            weapData.push({ name: 'healLvl1', value: row[i][33] });
            weapData.push({ name: 'heal', value: row[i][34] });
            weapData.push({ name: 'rAbiilty1PtScale', value: row[i][35] });
            weapData.push({ name: 'rAbiilty2PtScale', value: row[i][36] });
            weapData.push({ name: 'r1', value: row[i][37] });
            weapData.push({ name: 'r2', value: row[i][38] });

            weaponDatabase.push(weapData);
        }
    }
}
