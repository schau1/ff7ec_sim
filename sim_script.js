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
var gear, mainHand, offHand, ultimate, sub1, sub2, sub3;
let simChar = [];
var lastBreak = Date.now();
var stopRunning = true;
var databaseLoaded = false; // set to true once userWeapList has calculated value for OBs and Rs
var lastBarUpdate = Date.now();

readCharDatabase();
readWeaponDatabase();
readGearDatabase();
//processUserJsonData();

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

function fillUltimate() {
    if (!stopRunning) {
        alert("Stopping in progress sim.");
        stopRunning = true;
    }

    let dropdown = document.getElementById("ULDiv");
    var firstChild = dropdown.children[0];  // Save the search Filter

    dropdown.textContent = '';
    dropdown.appendChild(firstChild);   //add back the search field

    var item = document.createElement("a");
    item.setAttribute('class', 'w3-bar-item w3-button');
    item.innerHTML = "Reset";
    item.onclick = function () {
        var divParent = this.parentNode.parentNode;

        weaponSearchAndMarkAvailable(divParent.children[0].innerHTML, "Y");
        weaponSearchAndMarkAvailable(this.innerHTML, "N");

        divParent.children[0].innerHTML = "Ultimate";
    };

    dropdown.appendChild(item);

    // if there is a userlist, we use the userlist. If not we use the main database
    if (userWeapList.length == 0) {
        readWeaponDatabase();
        populateUserWeapListUsingDatabase();
    }

    outputCharWeapon(dropdown, userWeapList, charName, true);
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

    var item = document.createElement("a");
    item.setAttribute('class', 'w3-bar-item w3-button');
    item.innerHTML = "Reset";
    item.onclick = function () {            
        var divParent = this.parentNode.parentNode;

        weaponSearchAndMarkAvailable(divParent.children[0].innerHTML, "Y");
        weaponSearchAndMarkAvailable(this.innerHTML, "N");

        divParent.children[0].innerHTML = "Subweapon";
    };

    dropdown.appendChild(item);

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

    var item = document.createElement("a");
    item.setAttribute('class', 'w3-bar-item w3-button');
    item.innerHTML = "Reset";
    item.onclick = function () {
        resetBlkList("blklistList");
    };

    dropdown.appendChild(item);


    // if there is a userlist, we use the userlist. If not we use the main database
    if (userWeapList.length == 0) {
        readWeaponDatabase();
        populateUserWeapListUsingDatabase();
    }

    outputBlacklistWeaponList(dropdown, userWeapList);
}

function runSimMh() {
    if (!runSim(true)) {
        console.log("Fail to run sim");
    }
}

function runSimOh() {
    if (!runSim(false)) {
        console.log("Fail to run sim");
    }
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

        return true;
    }   

    return false;
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
        if ((userWeapList[i].name == character.mh) ||
            (userWeapList[i].name == character.oh)) {
            userWeapList[i].avail = "N";
            continue;
        }

        if ((userWeapList[i].avail == "N") &&
            (userWeapList[i].name != character.sub1))
            continue;

        // If we already have a sub1 weapon, we will find the weapon in the list and sim only that one
        if (!findSub1 && (userWeapList[i].name != character.sub1))
            continue;

        if (stopRunning) {
            return 0;
        }

        for (var j = 0; j != userWeapList.length; j++)         {
            if ((userWeapList[j].avail == "N") &&
                (userWeapList[j].name != character.sub2))
                continue;

            if ((userWeapList[j].name == userWeapList[i].name) ||
                (userWeapList[j].name == character.mh) ||
                (userWeapList[j].name == character.oh))
                continue;

            // If we already have a sub2 weapon, we will find the weapon in the list and sim only that one
            if (!findSub2 && (userWeapList[j].name != character.sub2))
                continue;

            for (var z = 0; z != userWeapList.length; z++)             {
                if ((userWeapList[z].name == userWeapList[j].name) ||
                    (userWeapList[z].name == userWeapList[i].name) ||
                    (userWeapList[z].name == character.mh) ||
                    (userWeapList[z].name == character.oh))
                    continue;

                if (userWeapList[z].avail == "N")
                    continue;

                // WTF are we doing if we're not looking for any weapon
                if (!findSub3)
                    continue;

                sim = { ...character }; 
                sim.sub1 = userWeapList[i].name;
                sim.sub1ob = userWeapList[i].ob;
                sim.sub1lvl = userWeapList[i].level;
                sim.sub2 = userWeapList[j].name;
                sim.sub2ob = userWeapList[j].ob;
                sim.sub2lvl = userWeapList[j].level;
                sim.sub3 = userWeapList[z].name;
                sim.sub3ob = userWeapList[z].ob;
                sim.sub3lvl = userWeapList[z].level;

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
    character.sub1ob = bestStatMH.sub1ob;
    character.sub2ob = bestStatMH.sub2ob;
    character.sub3ob = bestStatMH.sub3ob;
    character.sub1lvl = bestStatMH.sub1lvl;
    character.sub2lvl = bestStatMH.sub2lvl;
    character.sub3lvl = bestStatMH.sub3lvl;

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
    item.innerHTML = "  Gear: " + character.gear;
    ul.appendChild(item);

    item = document.createElement("li");
    item.innerHTML = "  Main hand: " + character.mh + "      OB" + character.mhOb + " Level " + character.mhLvl;
    ul.appendChild(item);

    item = document.createElement("li");
    item.innerHTML = "  Off hand: " + character.oh + "     OB" + character.ohOb + " Level " + character.ohLvl;
    ul.appendChild(item);

    item = document.createElement("li");
    item.innerHTML = "  Ultimate: " + character.ul;
    ul.appendChild(item);

    item = document.createElement("li");
    item.innerHTML = "  Subweapon: " + character.sub1 + "     OB" + character.sub1ob + " Level " + character.sub1lvl;
    ul.appendChild(item);

    item = document.createElement("li");
    item.innerHTML = "  Subweapon: " + character.sub2 + "     OB" + character.sub2ob + " Level " + character.sub2lvl;
    ul.appendChild(item);

    item = document.createElement("li");
    item.innerHTML = "  Subweapon: " + character.sub3 + "     OB" + character.sub3ob + " Level " + character.sub3lvl;
    ul.appendChild(item);

    element.appendChild(ul);

    item = document.createElement("p");
    item.innerHTML = "R Abilities: ";
    element.appendChild(item);

    ul = document.createElement("ul");

    if (character.boostHp > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost HP: " + character.boostHp + " (" + calculateBoostHpPercentStr(character.boostHp) + ")";
        ul.appendChild(item);
    }

    if (character.boostHpPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost HP (%): " + character.boostHpPercent * 100 + "%";
        ul.appendChild(item);
    }

    if (character.boostPatk > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost PATK: " + character.boostPatk + " (" + calculateBoostPatkPercent(character.boostPatk) + ")";
        ul.appendChild(item);
    }

    if (character.boostPatkPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost PATK (%): " + character.boostPatkPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostMatk > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost MATK: " + character.boostMatk + " (" + calculateBoostPatkPercentStr(character.boostMatk) + ")";
        ul.appendChild(item);
    }
    if (character.boostMatkPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost MATK (%): " + character.boostMatkPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostAtk > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost ATK: " + character.boostAtk + " (" + calculateBoostPatkPercentStr(character.boostAtk) + ")";
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
        item.innerHTML = "  Boost Fire Pot.: " + character.boostFirePot + " (" + calculateElementalPotPercentStr(character.boostFirePot) + ")";
        ul.appendChild(item);
    }
    if (character.boostFirePotPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Fire Pot. (%): " + character.boostFirePotPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostIcePot > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Ice Pot.: " + character.boostIcePot + " (" + calculateElementalPotPercentStr(character.boostIcePot) + ")";
        ul.appendChild(item);
    }
    if (character.boostIcePotPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Ice Pot. (%): " + character.boostIcePotPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostThunderPot > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Lightning Pot.: " + character.boostThunderPot + " (" + calculateElementalPotPercentStr(character.boostThunderPot) + ")";
        ul.appendChild(item);
    }
    if (character.boostThunderPotPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Lightning Pot.(%): " + character.boostThunderPotPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostWaterPot > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Water Pot.: " + character.boostWaterPot + " (" + calculateElementalPotPercentStr(character.boostWaterPot) + ")";
        ul.appendChild(item);
    }
    if (character.boostWaterPotPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Water Pot. (%): " + character.boostWaterPotPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostWindPot > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Wind Pot.: " + character.boostWindPot + " (" + calculateElementalPotPercentStr(character.boostWindPot) + ")";
        ul.appendChild(item);
    }
    if (character.boostWindPotPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Wind Pot. (%): " + character.boostWindPotPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostEarthPot > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Earth Pot.: " + character.boostEarthPot + " (" + calculateElementalPotPercentStr(character.boostEarthPot) + ")";
        ul.appendChild(item);
    }
    if (character.boostEarthPotPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Earth Pot. (%): " + character.boostEarthPotPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostPability > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Phys. Ability Pot.: " + character.boostPability + " (" + calculateAbilityPMPotPercentStr(character.boostPability) + ")";
        ul.appendChild(item);
    }
    if (character.boostPabilityPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Phys. Ability Pot. (%): " + character.boostPabilityPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostMability > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Mag. Ability Pot.: " + character.boostMability + " (" + calculateAbilityPMPotPercentStr(character.boostMability) + ")";
        ul.appendChild(item);
    }
    if (character.boostMabilityPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Mag. Ability Pot. (%): " + character.boostMabilityPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostAbility > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Ability Pot.: " + character.boostAbility + " (" + calculateAbilityPotPercentStr(character.boostAbility) + ")";
        ul.appendChild(item);
    }
    if (character.boostAbilityPercent > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost Ability Pot.(%): " + character.boostAbilityPercent * 100 + "%";
        ul.appendChild(item);
    }
    if (character.boostPdef > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost PDEF: " + character.boostPdef + " (" + calculateBoostPdefPercentStr(character.boostPdef) + ")";
        ul.appendChild(item);
    }
    if (character.boostMdef > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost MDEF: " + character.boostMdef + " (" + calculateBoostPdefPercentStr(character.boostMdef) + ")";
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
        item.innerHTML = "  Boost PATK (All): " + character.boostPatkAll + " (" + calculateBoostPatkAllPercentStr(character.boostPatkAll) + ")";;
        ul.appendChild(item);
    }
    if (character.boostMatkAll > 0) {
        item = document.createElement("li");
        item.innerHTML = "  Boost MATK (All): " + character.boostMatkAll + " (" + calculateBoostPatkAllPercentStr(character.boostMatkAll) + ")";;
        ul.appendChild(item);
    }

    element.appendChild(ul);

}

function weapAddWeaponStatstoCharStat(character) {
    var foundMh = false, foundOh = false, foundUL = false, foundSub1 = false, foundSub2 = false, foundSub3 = false;

    if (character.mainHand == "") { foundMh = true; }
    if (character.offHand == "") { foundOh = true; }
    if (character.ul == "") { foundUL = true; }
    if (character.sub1 == "") { foundSub1 = true; }
    if (character.sub2 == "") { foundSub2 = true; }
    if (character.sub3 == "") { foundSub3 = true; }

    for (var i = 0; i < userWeapList.length; i++) {
        var name = userWeapList[i].name;

        if (!foundMh && (character.mh == name)) {
            addWeapontoCharStat(character, userWeapList[i], true);
            character.mhPot = userWeapList[i].pot;
            character.mhElem = userWeapList[i].element;
            character.mhType = userWeapList[i].type;
            character.mhOb = userWeapList[i].ob;
            character.mhLvl = userWeapList[i].level;
            foundMH = true;
        }
        else if (!foundOh && (character.oh == name)) {
            addWeapontoCharStat(character, userWeapList[i], false);
            character.ohPot = userWeapList[i].pot;
            character.ohElem = userWeapList[i].element;
            character.ohType = userWeapList[i].type;
            character.ohOb = userWeapList[i].ob;
            character.ohLvl = userWeapList[i].level;
            foundOh = true;
        }
        else if (!foundUL && (character.ul == name)) {
            addWeapontoCharStat(character, userWeapList[i], true);
            foundUL = true;
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
    character.mhOb = 0;
    character.mhLvl = 0;
    character.mhType = "";
    character.mhElem = "";
    character.oh = offHand;
    character.ohOb = 0;
    character.ohLvl = 0;
    character.ohType = "";
    character.ohElem = "";
    character.ul = ultimate;
    character.sub1 = sub1;
    character.sub2 = sub2;
    character.sub3 = sub3;
    character.sub1ob = 0;
    character.sub2ob = 0;
    character.sub3ob = 0;
    character.sub1lvl = 0;
    character.sub2lvl = 0;
    character.sub3lvl = 0;
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
        if (char.name == simChar.name) {
            simChar.hp = char.hp;
            simChar.patk = char.patk;
            simChar.matk = char.matk;
            simChar.heal = char.heal;
            return;
        }
    });
}

function gearAddRFromGearToCharR(char) {

    gearList.forEach(function (gear) {
        if (gear.name == char.gear) {

            var rValue = gear.r1value;
            if (rValue > 0) {
                AddRFromGearToCharR(char, gear.r1, rValue, true);
            }

            rValue = gear.r2value;
            if (rValue > 0) {
                AddRFromGearToCharR(char, gear.r2, rValue, true);
            }

            rValue = parseInt(gear.r3value);
            if (rValue > 0) {
                AddRFromGearToCharR(char, gear.r3, rValue, true);
            }

            rValue = parseInt(gear.r4value);
            if (rValue > 0) {
                AddRFromGearToCharR(char, gear.r4, rValue, true);
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
    ultimate = document.getElementById("UlButton").innerHTML;
    sub1 = document.getElementById("sub1Button").innerHTML;
    sub2 = document.getElementById("sub2Button").innerHTML;
    sub3 = document.getElementById("sub3Button").innerHTML;

    mainHand = mainHand.replaceAll("&amp;", "&");
    offHand = offHand.replaceAll("&amp;", "&");
    ultimate = ultimate.replaceAll("&amp;", "&");

    // Validate the data
    if (!weaponIsFoundInUserList(mainHand)) {
        mainHand = "";
    }

    if (!weaponIsFoundInUserList(offHand)) {
        offHand = "";
    }

    if (!weaponIsFoundInUserList(ultimate)) {
        ultimate = "";
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

    var name = weap.name;
    userWeapList.forEach(function (elem) {
        if (name == elem.name) {
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

function resetBlkList(listName) {
    var divParent = document.getElementById(listName);
    while (divParent.firstChild) {
        weaponSearchAndMarkAvailable(divParent.lastChild.innerHTML, "Y");
        divParent.removeChild(divParent.lastChild);
    }

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

    databaseLoaded = false;

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

    input = document.getElementById("UlButton");
    weaponSearchAndMarkAvailable(input.innerHTML, "Y");
    input.innerHTML = "Ultimate";
    ultimate = "";

    input = document.getElementById("UlButton");
    weaponSearchAndMarkAvailable(input.innerHTML, "Y");
    input.innerHTML = "Ultimate";
    ultimate = "";

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

function userFilterUL() {
    filterFunction("userFilterUL", "ULDiv", "a");
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
        if (list[i].charName == charName){
            var item = document.createElement("a");
            item.setAttribute('class', 'w3-bar-item w3-button');
            item.innerHTML = list[i].name;
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
        item.innerHTML = nameList[i].name;
        item.onclick = function () {
            replaceHeaderWithCharName(this);
            resetWeaponSelection();
        };

        dropdown.appendChild(item);
    }
}

// Output the item in the itemList in the dropdown if the 
// name matched the passed in name
function outputCharWeapon(dropdown, itemList, charName, isUl=false) {
    for (var i = 0; i < itemList.length; i++) {
        if ((itemList[i].charName == charName) &&
            (itemList[i].avail != "N")) {

            if (isULWeapon(itemList[i].name) == isUl) {
                var item = document.createElement("a");
                item.setAttribute('class', 'w3-bar-item w3-button');
                item.innerHTML = itemList[i].name;
                item.onclick = function () {
                    replaceHeaderWithWeaponName(this);
                };

                dropdown.appendChild(item);
            }
        }
    }
}

function outputAllCharWeapon(dropdown, itemList) {
    for (var i = 0; i < itemList.length; i++) {
        if (itemList[i].avail != "N") {

            // Don't output Ultimate weapon
            if (!isULWeapon(itemList[i].name)) {

                var item = document.createElement("a");
                item.setAttribute('class', 'w3-bar-item w3-button');
                item.innerHTML = itemList[i].name;
                item.onclick = function () { 
                    replaceHeaderWithWeaponName(this);
                };

                dropdown.appendChild(item);
            }
        }
    }
}

function isULWeapon(name) {
    for (var i = 0; i < weaponDatabase.length; i++) {
        if (weaponDatabase[i].name == name) {
            if (weaponDatabase[i].isUl == "Y") {
                return true;
            }
        }
    }

    return false;
}

function outputBlacklistWeaponList(dropdown, itemList) {
    for (var i = 0; i < itemList.length; i++) {
        if (itemList[i].avail != "N") {
            var item = document.createElement("a");
            item.setAttribute('class', 'w3-bar-item w3-button');
            item.innerHTML = itemList[i].name;
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
        if (userWeapList[i].name == name) {
            userWeapList[i].avail = avail;
        }
    }
}
function weaponIsFoundInUserList(name) {
    for (var i = 0; i < userWeapList.length; i++) {
        if (userWeapList[i].name == name) {
            return true;
        }
    }
    return false;
}

function weaponGetNameFromId(id) {
    for (var i = 0; i < weaponDatabase.length; i++) {
        if (weaponDatabase[i].id == id) {
            return [weaponDatabase[i].name, weaponDatabase[i].charName];
        }
    }
    return ['',''];
}

function gearIsFoundInGearList(name) {
    for (var i = 0; i < gearList.length; i++) {
        if (gearList[i].name == name) {
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

    weaponSearchAndMarkAvailable(cell.innerHTML.replaceAll("&amp;", "&"), "N");    

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

    weaponSearchAndMarkAvailable(cell.innerHTML.replaceAll("&amp;", "&"), "Y");
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
        if (array[i].charName == charName) {
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
        weapData.name = row[i][0];
        weapData.charName = row[i][1];
        weapData.level = parseInt(row[i][2]);
        weapData.ob = parseInt(row[i][3]);
        weapData.extraOb = row[i][4];   // not used
        weapData.avail = row[i][5]; // avail to sim
        weapData.id = 0; // weaponId

        userWeapList.push(weapData);
    }

    resetFunc();

    //    printArray(userWeapList);
}

// Process user data in JSON format
function processUserJsonData(text) {
    var data = JSON.parse(text)

    if (data.hasOwnProperty('userWeaponList')) {
        userWeapList = [];

        for (var i = 0; i < data.userWeaponList.length; i++) {
            var weapon = data.userWeaponList[i];
            var level;
            var ob;
            let weapData = [];

            // 400k is 120, 312k is 110, 160k is 90, 104k is 80
            if (weapon.exp > 312000) {
                level = 120;
            }
            else if (weapon.exp > 160000) {
                level = 110;
            }
            else if (weapon.exp > 104000) {
                level = 90;
            }
            else {  // level could be less, but if it's under 80, they can get to 80
                level = 80;
            }

            if (weapon.weaponUpgradeType > 1) {
                ob = 10;
            }
            else {
                ob = weapon.upgradeCount;
            }
            weapData.name = '';
            weapData.charName = '';
            weapData.level = level;
            weapData.ob = ob;
            weapData.extraOb = 0;
            weapData.avail = 'Y';
            weapData.id = weapon.weaponId;
            userWeapList.push(weapData);
        }

        for (var i = 0; i < userWeapList.length; i++) {
            [userWeapList[i].name, userWeapList[i].charName] = weaponGetNameFromId(userWeapList[i].id);
            /*        const values = weaponGetNameFromId(userWeapList[i].id);
                    userWeapList[i].name = values[0];
                    userWeapList[i].charName = values[1];*/
        }

        //console.log(weaponDatabase);

        resetFunc();
    }
    else {
        alert("Wrong format for JSON file. Please enter a correct file.");
    }

//    console.log(userWeapList);
}
function fetchJSONData(filename) {
    fetch(filename)
        .then((res) => {
            if (!res.ok) {
                throw new Error
                    (`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            console.log(data)
        })
        .catch((error) =>
            console.error("Unable to fetch data:", error));
}
function populateUserWeapListUsingDatabase() {
    for (var i = 0; i < weaponDatabase.length; i++) {
        let weapData = [];
        weapData.name = weaponDatabase[i].name;
        weapData.charName = weaponDatabase[i].charName;
        weapData.level = 110; // @Todo. should be user option

        if (weaponDatabase[i].isUl == "Y") {
            weapData.ob = 0; // UL doesn't OB
        }
        else {
            weapData.ob = 10;
        }

        weapData.extraOb = 0;
        weapData.avail = 'Y'; // avail to sim
        weapData.id = weaponDatabase.id;

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
            data.name = row[i][0];
            data.charName = row[i][1];
            data.r1 = parseInt(row[i][2]);
            data.r1value = parseInt(row[i][3]);
            data.r2 = parseInt(row[i][4]);
            data.r2value = parseInt(row[i][5]);
            data.r3 = parseInt(row[i][6]);
            data.r3value = parseInt(row[i][7]);
            data.r4 = parseInt(row[i][8]);
            data.r4value = parseInt(row[i][9]);
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
            data.name = row[i][0];
            data.hp = parseInt(row[i][1]);
            data.patk = parseInt(row[i][2]);
            data.matk = parseInt(row[i][3]);
            data.pdef = parseInt(row[i][4]);   
            data.mdef = parseInt(row[i][5]);
            data.heal = parseInt(row[i][6]);
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
            var i = 0, m = 0;
            let weapData = [];
            weapData.name = row[i][m]; m++;
            weapData.charName = row[i][m]; m++;
            weapData.sigil = row[i][m]; m++;
            weapData.atb = parseInt(row[i][m]); m++;
            weapData.type = row[i][m]; m++;
            weapData.element = row[i][m]; m++;
            weapData.range = row[i][m]; m++;
            weapData.effect1Target = row[i][m]; m++;
            weapData.effect1 = row[i][m]; m++;
            weapData.effect1Pot = row[i][m]; m++;
            weapData.effect1MaxPot = row[i][m]; m++;
            weapData.effect2Target = row[i][m]; m++;
            weapData.effect2 = row[i][m]; m++;
            weapData.effect2Pot = row[i][m]; m++;
            weapData.effect2MaxPot = row[i][m]; m++;
            weapData.effect3Target = row[i][m]; m++;
            weapData.effect3 = row[i][m]; m++;
            weapData.effect3Pot = row[i][m]; m++;
            weapData.effect3MaxPot = row[i][m]; m++;
            weapData.support1 = row[i][m]; m++;
            weapData.support2 = row[i][m]; m++;
            weapData.support3 = row[i][m]; m++;
            weapData.rAbility1 = row[i][m]; m++;
            weapData.rAbility2 = row[i][m]; m++;
            weapData.potOb10 = parseInt(row[i][m]); m++;
            weapData.maxPotOb10 = parseInt(row[i][m]); m++;
            weapData.effect1Dur = row[i][m]; m++;
            weapData.effect2Dur = row[i][m]; m++;
            weapData.effect3Dur = row[i][m]; m++;
            weapData.condition1 = row[i][m]; m++;
            weapData.condition2 = row[i][m]; m++;
            weapData.condition3 = row[i][m]; m++;
            weapData.potOb0 = parseInt(row[i][m]); m++;
            weapData.potOb1 = parseInt(row[i][m]); m++;
            weapData.potOb6 = parseInt(row[i][m]); m++;
            weapData.patkLvl1 = parseInt(row[i][m]); m++;
            weapData.patk = parseInt(row[i][m]); m++;
            weapData.matkLvl1 = parseInt(row[i][m]); m++;
            weapData.matk = parseInt(row[i][m]); m++;
            weapData.healLvl1 = parseInt(row[i][m]); m++;
            weapData.heal = parseInt(row[i][m]); m++;
            weapData.rAbiilty1PtScale = parseInt(row[i][m]); m++;
            weapData.rAbiilty2PtScale = parseInt(row[i][m]); m++;
            weapData.r1 = parseInt(row[i][m]); m++;
            weapData.r2 = parseInt(row[i][m]); m++;
            weapData.isUl = row[i][m]; m++;
            weapData.effect1Range = row[i][m]; m++;
            weapData.uses = parseInt(row[i][m]); m++;
            weapData.id = parseInt(row[i][m]); m++;

            weaponDatabase.push(weapData);
        }

//        console.log(weaponDatabase);
    }
}
