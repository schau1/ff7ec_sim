//                        OB0  OB1   OB2   OB3  OB4   OB5    OB6  OB7    OB8   OB9  OB10
const obHealStatPercent = [ 1, 1.1, 1.15, 1.20, 1.24, 1.28, 1.32, 1.34, 1.36, 1.38, 1.40 ];
const obPAtkStatPercent = [ 1, 1.4, 1.70, 1.90, 2.00, 2.10, 2.20, 2.25, 2.30, 2.35, 2.40 ];

const R1TABL_COL90 = 9;
const ENEMY_DEFENSE = 100;
const STANCE = 0.50;
const MIN_VARIANCE = 0.984375;
const MAX_VARIANCE = 1.015625;

/**
 * Enum for gear R ability. Based on database value. Keep this in sync with rType in FF7EC.vxproj
 * @readonly
 * @enum {{name: string, value: string}}
 */
const RABILITY = Object.freeze({
    R_TYPE_OTHER: { name: "Boost Others (N/A)", value: "0" },
    R_TYPE_HP: { name: "Boost HP", value: "1" },
    R_TYPE_HP_PERCENT: { name: "Boost HP", value: "2" },
    R_TYPE_PATK: { name: "Boost PATK", value: "3" },
    R_TYPE_PATK_PERCENT: { name: "Boost PATK", value: "4" },
    R_TYPE_MATK: { name: "Boost MATK", value: "5" },
    R_TYPE_MATK_PERCENT: { name: "Boost MATK", value: "6" },
    R_TYPE_ATK: { name: "Boost ATK", value: "7" },
    R_TYPE_ATK_PERCENT: { name: "Boost ATK", value: "8" },
    R_TYPE_HEAL: { name: "Boost HEAL", value: "9" },
    R_TYPE_HEAL_PERCENT: { name: "Boost HEAL", value: "10" },
    R_TYPE_CRIT_POT: { name: "Boost Crit. Pot.", value: "11" },
    R_TYPE_CRIT_POT_PERCENT: { name: "Boost Crit. Pot.", value: "12" },
    R_TYPE_FIRE_POT: { name: "Boost Fire Pot.", value: "13" },
    R_TYPE_FIRE_POT_PERCENT: { name: "Boost Fire Pot.", value: "14" },
    R_TYPE_ICE_POT: { name: "Boost Ice Pot.", value: "15" },
    R_TYPE_ICE_POT_PERCENT: { name: "Boost Ice Pot.", value: "16" },
    R_TYPE_THUNDER_POT: { name: "Boost Lightning Pot.", value: "17" },
    R_TYPE_THUNDER_POT_PERCENT: { name: "Boost Lightning Pot.", value: "18" },
    R_TYPE_WATER_POT: { name: "Boost Water Pot.", value: "19" },
    R_TYPE_WATER_POT_PERCENT: { name: "Boost Water Pot.", value: "20" },
    R_TYPE_WIND_POT: { name: "Boost Wind Pot.", value: "21" },
    R_TYPE_WIND_POT_PERCENT: { name: "Boost Wind Pot.", value: "22" },
    R_TYPE_EARTH_POT: { name: "Boost Earth Pot.", value: "23" },
    R_TYPE_EARTH_POT_PERCENT: { name: "Boost Earth Pot.", value: "24" },
    R_TYPE_PABILITY: { name: "Boost Phys. Ability Pot.", value: "25" },
    R_TYPE_PABILITY_PERCENT: { name: "Boost Phys. Ability Pot.", value: "26" },
    R_TYPE_MABILITY: { name: "Boost Mag. Ability Pot.", value: "27" },
    R_TYPE_MABILITY_PERCENT: { name: "Boost Mag. Ability Pot.", value: "28" },
    R_TYPE_ABILITY: { name: "Boost Ability Pot.", value: "29" },
    R_TYPE_ABILITY_PERCENT: { name: "Boost Ability Pot.", value: "30" },
    R_TYPE_PDEF: { name: "Boost PDEF", value: "31" },
    R_TYPE_MDEF: { name: "Boost MDEF", value: "32" },
    R_TYPE_DEFBUFF_EXT: { name: "Debuff Extension", value: "33" },
    R_TYPE_BUFFDEBUFF_EXT: { name: "Buff/Debuff Extension", value: "34" },
    R_TYPE_BUFFDEBUFF_EXT_PERCENT: { name: "Buff/Debuff Extension Percent", value: "35" },
    R_TYPE_ATK_ALL: { name: "Boost ATK (All Allies)", value: "36" },
    R_TYPE_ATK_ALL_PERCENT: { name: "Boost ATK (All Allies) Percent", value: "37" },
    R_TYPE_PATK_ALL: { name: "Boost PATK (All Allies)", value: "38" },
    R_TYPE_PATK_ALL_PERCENT: { name: "Boost PATK (All Allies) Percent", value: "39" },
    R_TYPE_MATK_ALL: { name: "Boost MATK (All Allies)", value: "40" },
    R_TYPE_MATK_ALL_PERCENT: { name: "Boost MATK (All Allies) Percent", value: "41" }
});


//                Pts gained by level
//                 Col Col  Col Col Col
//                 0    1    2   3   4   5   6   7   8   9   10 11 
//           lvl90base  20   30  40  50  60  70  80  90 100 110 120   
const r1Table = [ [ 16, 3, 0, 7, 0, 0, 0, 6, 0, 2, 0, 2],
                  [ 24, 4, 0, 10, 0, 0, 0, 10, 0, 3, 0, 3],
                  [ 32, 6, 0, 14, 0, 0, 0, 12, 0, 4, 0, 4] ];

const r2Table = [ [6, 0, 0, 0, 0, 4, 0, 0, 2, 0, 2, 0],
                  [9, 0, 0, 0, 0, 6, 0, 0, 3, 0, 3, 0],
                  [12, 0, 0, 0, 0, 8, 0, 0, 4, 0, 4, 0],
                  [15, 0, 0, 0, 0, 5, 0, 0, 10, 0, 10, 0],
                  [4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 2, 0]];   // event weapon

// Use look up table mechanics instead of adding up math like I did for level
// base is level 90
//                   Total Pts gained by OB
//                   Col Col  Col Col Col
//                   0     1    2   3   4   5    6   7    8   9    10  11 
//                   base  OB0  OB1 OB2 OB3 OB4 OB5 OB6 OB7  OB8  OB9  OB10   
const r1ObTable = [   [ 16, 0, 1, 1, 4, 4, 7, 7, 7, 10, 10, 11],
                      [ 24, 0, 2, 2, 6, 6, 10, 10, 10, 14, 14, 16],
                      [ 32, 0, 2, 2, 8, 8, 14, 14, 14, 20, 20, 22] ];

const r2ObTable = [   [ 6, 0, 2, 6, 6, 10, 10, 10, 14, 14, 18, 18], 
                      [ 9, 0, 3, 9, 9, 15, 15, 15, 21, 21, 27, 27],
                      [12, 0, 4, 12, 12, 20, 20, 20, 28, 28, 36, 36],
                      [15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // UL weapon
                      [ 4, 0, 2, 6, 6, 10, 10, 10, 14, 14, 18, 20] ];   // event weapon


function calcStatBaseOnLevelAndOb(weap) {
    var name = weap.name;

    weaponDatabase.forEach(function (element) {
        if (name == element.name) {
            weap.element = element.element;

            calcRAbilityStatBaseOnLevelAndOb(weap, element);

            weap.heal = calcHealBaseOnLevelAndOb(weap, element);
            weap.patk = calcPatkBaseOnLevelAndOb(weap, element);
            weap.matk = calcMatkBaseOnLevelAndOb(weap, element);
            weap.pot = calcSkillPotencyBaseOnOb(weap, element);    // assume single target

            weap.type = element.type;  // Mag. or Phys.
            weap.element = element.element;
            weap.range = element.range; 

            weap.r1 = element.r1;        
            weap.r2 = element.r2;        
            return;
        }
    });   
}

function calcRAbilityStatBaseOnLevelAndOb(weap, element) {
    var level = parseInt(weap.level);
    var ob = parseInt(weap.ob);
    var newR1 = 0, newR2 = 0;

    for (var row = 0; row < r1Table.length; row++)
    {
        if (element.rAbiilty1PtScale == r1Table[row][0]) {
            newR1 = calcRBaseOnLevel(level, r1Table[row], r1Table[row].length);
            newR1 += calcRBaseOnOb(ob, r1ObTable[row], r1ObTable[row].length);
            break;
        }
    }

    for (var row = 0; row < r2Table.length; row++)
    {
        if (element.rAbiilty2PtScale == r2Table[row][0]) {
            newR2 = calcRBaseOnLevel(level, r2Table[row], r2Table[row].length);
            newR2 += calcRBaseOnOb(ob, r2ObTable[row], r2ObTable[row].length);
            break;
        }
    }

    weap.r1value = newR1;
    weap.r2value = newR2;
    
    if ((newR1 == 0 || newR2 == 0) && level > 50) {
        console.log("Cannot calc R: " + weap.name + " " + " R1: " + element.rAbiilty1PtScale + " R2: " + element.rAbiilty2PtScale)
    }
}

function calcRBaseOnOb(ob, table, maxCol) {
    // According to the r1ObTable and r2ObTable, Ob0 match col 1, Ob1 match col 2 and so on...
    if (ob >= 0 && ob < maxCol) {
        return table[ob + 1];
    }
    else {
        return 0;
    }
}

function calcRBaseOnLevel(level, table, maxCol) {
    var col = 0;
    var totalPts = table[0];    // set value to the base at level 90

    if (level < 20) {
        col = 1;
    }
    else if (level >= 20 && level < 30) {
        col = 2;
    }
    else if (level >= 30 && level < 40) {
        col = 3;
    }
    else if (level >= 40 && level < 50) {
        col = 4;
    }
    else if (level >= 50 && level < 60) {
        col = 5;
    }
    else if (level >= 60 && level < 70) {
        col = 6;
    }
    else if (level >= 70 && level < 80) {
        col = 7;
    }
    else if (level >= 80 && level < 90) {
        col = 8;
    }
    else if (level >= 90 && level < 100) {
        col = 9;
    }
    else if (level >= 100 && level < 110) {
        col = 10;
    }
    else if (level >= 110 && level < 120) {
        col = 11;
    }
    else if (level == 120) {
        col = 12;
    }

    if (col < R1TABL_COL90) {                        // level 80 or below    
        for (var i = R1TABL_COL90 - 1; i >= col; i--) { // start at level 90
            if (totalPts >= table[i]) {
                totalPts -= table[i];
            }
        }
    }
    else if (col > R1TABL_COL90 && col <= maxCol) { // level 100 or above
        for (var i = R1TABL_COL90; i < col; i++) {
            totalPts += table[i];
        }
    }

    return totalPts;
}

function calcHealBaseOnLevelAndOb(weap, element) {
    var level = parseInt(weap.level);
    var heal = parseInt(element.heal);
    var healLvl1 = parseInt(element.healLvl1);
    var ob = parseInt(weap.ob);

    // calcStatGain based on level
    var value = calcStatgainBaseOnLevel(healLvl1, heal, level);

    // calStat at the current ob
    if (ob >= 0 && ob <= 10) {
        value = value * obHealStatPercent[ob];
    }

    return Math.round(value);
}

function calcPatkBaseOnLevelAndOb(weap, element) {
    var level = parseInt(weap.level);
    var stat = parseInt(element.patk);
    var statLvl1 = parseInt(element.patkLvl1);
    var ob = parseInt(weap.ob);

    // calcStatGain based on level
    var value = calcStatgainBaseOnLevel(statLvl1, stat, level);

    // calStat at the current ob
    if (ob >= 0 && ob <= 10) {
        value = value * obPAtkStatPercent[ob];
    }

    return Math.round(value);
}

function calcMatkBaseOnLevelAndOb(weap, element) {
    var level = parseInt(weap.level);
    var stat = parseInt(element.matk);
    var statLvl1 = parseInt(element.matkLvl1);
    var ob = parseInt(weap.ob);

    // calcStatGain based on level
    var value = calcStatgainBaseOnLevel(statLvl1, stat, level);

    // calStat at the current ob
    if (ob >= 0 && ob <= 10) {
        value = value * obPAtkStatPercent[ob];
    }

    return Math.round(value);
}

function calcStatgainBaseOnLevel(statLvl1, stat, level) {
    var value = (stat - statLvl1) / 1.2;    // average gain per level
    var levelValue = 1;

    // calStat at the current level
    if (level <= 70) levelValue = 0.775;
    else if (level <= 80) levelValue = 0.887;
    else if (level <= 90) levelValue = 1;
    else if (level <= 100) levelValue = 1.067;
    else if (level <= 110) levelValue = 1.134;
    else if (level <= 120) levelValue = 1.200;

    value = (value * levelValue) + statLvl1;

    // Don't support level in between, upgrade to the next level
    return value;
}

function calcSkillPotencyBaseOnOb(weap, element) {
    var ob = parseInt(weap.ob);
    var pot;

    if (ob == 10) {
        pot = element.potOb10;
    }
    else if (ob == 0) {
        pot = element.potOb0;        
    }
    else if (ob >= 1 && ob < 6) {
        pot = element.potOb1;
    }
    else {
        pot = element.potOb6;
    }

    return parseInt(pot)/100;
}


function AddRFromGearToCharR(character, type, value, isFullValue) {
    var newValue = value;

    if (!isFullValue) { newValue = Math.floor(value / 2); } // round down

    if (type == RABILITY.R_TYPE_HP.value) {
        character.boostHp += newValue;
    }
    else if (type == RABILITY.R_TYPE_HP_PERCENT.value) {
        character.boostHpPercent += newValue / 100;
    }
    else if (type == RABILITY.R_TYPE_PATK.value) {
        character.boostPatk += newValue;
    }
    else if (type == RABILITY.R_TYPE_PATK_PERCENT.value) {
        character.boostPatkPercent += newValue / 100;
    }
    else if (type == RABILITY.R_TYPE_MATK.value) {
        character.boostMatk += newValue;
    }
    else if (type == RABILITY.R_TYPE_MATK_PERCENT.value) {
        character.boostMatkPercent += newValue / 100;
    }
    else if (type == RABILITY.R_TYPE_ATK.value) {
        character.boostAtk += newValue;
    }
    else if (type == RABILITY.R_TYPE_ATK_PERCENT.value) {
        character.boostAtkPercent += newValue / 100;
    }
    else if (type == RABILITY.R_TYPE_HEAL.value) {
        character.boostHeal += newValue;
    }
    else if (type == RABILITY.R_TYPE_HEAL_PERCENT.value) {
        character.boostHealPercent += newValue / 100;
    }
    else if (type == RABILITY.R_TYPE_CRIT_POT.value) {
        character.boostCrit += newValue;
    }
    else if (type == RABILITY.R_TYPE_CRIT_POT_PERCENT.value) {
        character.boostCritPercent += newValue / 100;
    }
    else if (type == RABILITY.R_TYPE_FIRE_POT.value) {
        character.boostFirePot += newValue;
    }
    else if (type == RABILITY.R_TYPE_FIRE_POT_PERCENT.value) {
        character.boostFirePotPercent += newValue / 100;
    }
    else if (type == RABILITY.R_TYPE_ICE_POT.value) {
        character.boostIcePot += newValue;
    }
    else if (type == RABILITY.R_TYPE_ICE_POT_PERCENT.value) {
        character.boostIcePotPercent += newValue / 100;
    }
    else if (type == RABILITY.R_TYPE_THUNDER_POT.value) {
        character.boostThunderPot += newValue;
    }
    else if (type == RABILITY.R_TYPE_THUNDER_POT_PERCENT.value) {
        character.boostThunderPotPercent += newValue / 100;
    }
    else if (type == RABILITY.R_TYPE_WATER_POT.value) {
        character.boostWaterPot += newValue;
    }
    else if (type == RABILITY.R_TYPE_WATER_POT_PERCENT.value) {
        character.boostWaterPotPercent += newValue / 100;
    }
    else if (type == RABILITY.R_TYPE_WIND_POT.value) {
        character.boostWindPot += newValue;
    }
    else if (type == RABILITY.R_TYPE_WIND_POT_PERCENT.value) {
        character.boostWindPotPercent += newValue / 100;
    }
    else if (type == RABILITY.R_TYPE_EARTH_POT.value) {
        character.boostEarthPot += newValue;
    }
    else if (type == RABILITY.R_TYPE_EARTH_POT_PERCENT.value) {
        character.boostEarthPotPercent += newValue / 100;
    }
    else if (type == RABILITY.R_TYPE_PABILITY.value) {
        character.boostPability += newValue;
    }
    else if (type == RABILITY.R_TYPE_PABILITY_PERCENT.value) {
        character.boostPabilityPercent += newValue / 100;
    }
    else if (type == RABILITY.R_TYPE_MABILITY.value) {
        character.boostMability += newValue;
    }
    else if (type == RABILITY.R_TYPE_MABILITY_PERCENT.value) {
        character.boostMabilityPercent += newValue / 100;
    }
    else if (type == RABILITY.R_TYPE_ABILITY.value) {
        character.boostAbility += newValue;
    }
    else if (type == RABILITY.R_TYPE_ABILITY_PERCENT.value) {
        character.boostAbilityPercent += newValue / 100;
    }
    else if (type == RABILITY.R_TYPE_PDEF.value) {
        character.boostPdef += newValue;
    }
    else if (type == RABILITY.R_TYPE_MDEF.value) {
        character.boostMdef += newValue;
    }
    else if (type == RABILITY.R_TYPE_DEFBUFF_EXT.value) {
        character.boostDebuffExt += newValue;
    }
    else if (type == RABILITY.R_TYPE_BUFFDEBUFF_EXT.value) {
        character.boostBuffDebuffExt += newValue;
    }
    else if (type == RABILITY.R_TYPE_PATK_ALL.value) {
        character.boostPatkAll += newValue;
    }
    else if (type == RABILITY.R_TYPE_MATK_ALL.value) {
        character.boostMatkAll += newValue;
    }
    else if (type == RABILITY.R_TYPE_ATK_ALL.value) {
        character.boostAtkAll += newValue;
    }
}

function addWeapontoCharStat(character, weapon, isMh) {
    if (isMh) {
        // add full stats
        character.heal += weapon.heal;
        character.matk += weapon.matk;
        character.patk += weapon.patk;
    }
    else {
        // add half the stats
        character.heal += Math.floor(weapon.heal / 2);
        character.matk += Math.floor(weapon.matk / 2);
        character.patk += Math.floor(weapon.patk / 2);
    }

    AddRFromGearToCharR(character, weapon.r1, weapon.r1value, isMh);
    AddRFromGearToCharR(character, weapon.r2, weapon.r2value, isMh);
}

// Add up all the stats on the character
function calcTotalStatFromCharR(character) {
    var percent = 0;
    var value = 0;
    var PallPercent = 0;
    var MallPercent = 0;
    var patk_value = 0;
    var matk_value = 0;
    var HpPercent = 0;
    var hp_value = 0;
    var HealPercent = 0;
    var heal_value = 0;

    if (character.boostHp > 0) {
        HpPercent = calculateBoostHpPercent(character.boostHp);
        hp_value = calcExtraHpFromR(percent);
        //    character.hp = Math.floor((character.hp + value) * (1 + percent));
        //character.hp = Math.floor(Math.floor(character.hp * (1 + percent)) * (1+MY_HW_HP) + value);
    }

    if (character.boostHpPercent > 0) {
        HpPercent += character.boostHpPercent;
    }

    if (character.boostMatkAll > 0) {
        MallPercent = calculateBoostMatkAllPercent(character.boostMatkAll);
        matk_value += calcExtraMatkFromPatkAll(MallPercent);
    }

    if (character.boostPatkAll > 0) {
        PallPercent = calculateBoostPatkAllPercent(character.boostPatkAll);
        patk_value += calcExtraPatkFromPatkAll(PallPercent);
    }

    if (character.boostPatk > 0) {
        percent = calculateBoostPatkPercent(character.boostPatk);
        PallPercent += percent;
        patk_value += calcExtraPatkFromR(percent);
    }

    if (character.boostMatk > 0) {
        percent = calculateBoostMatkPercent(character.boostMatk);
        MallPercent += percent;
        matk_value += calcExtraMatkFromR(percent);
    }

    if (character.boostAtk > 0) {
        percent = calculateBoostAtkPercent(character.boostAtk);
        value = calcExtraAtkFromR(percent);
        matk_value += value;
        patk_value += value;
        MallPercent += percent;
        PallPercent += percent;

//        character.patk = Math.floor((character.patk + value) * (1 + percent));
//        character.matk = Math.floor((character.matk + value) * (1 + percent));
    }

    if (character.boostAtkAll > 0) {
        percent = calculateBoostAtkAllPercent(character.boostAtkAll);
        value = calcExtraAtkFromAtkAll(percent);
        matk_value += value;
        patk_value += value;
        MallPercent += percent;
        PallPercent += percent;
    }

    if (character.boostPdef > 0) {
        percent = calculateBoostPdefPercent(character.boostPdef);
        value = calcExtraHpFromR(percent);

        character.pdef = Math.floor((character.pdef + value) * (1 + percent));
    }

    if (character.boostMdef > 0) {
        percent = calculateBoostMdefPercent(character.boostMdef);
        character.mdef = Math.floor((character.mdef) * (1 + percent));
    }

    if (character.boostHeal > 0) {
        HealPercent = calculateBoostHealPercent(character.boostHeal);
        heal_value = calcExtraHealFromR(HealPercent);
    }


//    console.log("Pall%: " + PallPercent + "  value: " + patk_value);
//    console.log("Mall%: " + MallPercent + "  value: " + matk_value);
    character.patk = Math.floor(Math.floor(character.patk * (1 + PallPercent))*(1 + MY_HW_PATK) + Math.floor(patk_value * (1 + PallPercent)));
    character.matk = Math.floor(Math.floor(character.matk * (1 + MallPercent))*(1 + MY_HW_MATK) + Math.floor(matk_value * (1 + MallPercent)));
    character.hp = Math.floor(Math.floor(character.hp * (1 + HpPercent)) * (1 + MY_HW_HP) + hp_value);
    character.heal = Math.floor(Math.floor(character.heal * (1 + HealPercent)) * (1 + MY_HW_HEAL) + heal_value);
}

function calcExtraAtkFromR(percent) {
    if (percent < 0.03) {
        return 0;
    }
    else if (percent >= 0.03 && percent < 0.05) {
        return 5;
    }
    else if (percent >= 0.05 && percent < 0.07) {
        return 10;
    }
    else if (percent >= 0.07 && percent < 0.10) {
        return 30;
    }
    else if (percent >= 0.10 && percent < 0.15) {
        return 50;
    }
    else if (percent >= 0.15 && percent < 0.20) {
        return 50;
    }
    else {
        return 50;
    }
}

function calcExtraPatkFromR(percent) {
    if (percent < 0.05) {
        return 0;
    }
    else if (percent >= 0.05 && percent < 0.10) {
        return 10;
    }
    else if (percent >= 0.10 && percent < 0.15) {
        return 20;
    }
    else if (percent >= 0.15 && percent < 0.20) {
        return 60;
    }
    else {
        return 100;
    }
}

function calcExtraMatkFromR(percent) {
    return calcExtraPatkFromR(percent);
}

// Calc. Extra HP we get from reaching a certain Lvl
function calcExtraHpFromR(percent) {
    if (percent < 0.05) {
        return 0;
    }
    else if (percent >= 0.05 && percent < 0.15) {
        return 25;
    }
    else if (percent >= 0.15 && percent < 0.30) {
        return 50;
    }
    else if (percent >= 0.30 && percent < 0.45) {
        return 150;
    }
    else {
        return 250;
    }
}

function calcExtraHealFromR(percent) {
    if (percent < 0.05) {
        return 0;
    }
    else if (percent >= 0.05 && percent < 0.15) {
        return 5;
    }
    else if (percent >= 0.15 && percent < 0.30) {
        return 10;
    }
    else if (percent >= 0.30 && percent < 0.45) {
        return 30;
    }
    else {
        return 50;
    }
}

    
function calculateBoostHpPercent(value) {
    if (value < 1) {
        return 0;
    }
    else if (value < 5) {
        return 0.05;
    }
    else if (value >= 5 && value < 15) {
        return 0.15;
    }
    else if (value >= 15 && value < 25) {
        return 0.30;
    }
    else if (value >= 25 && value < 35) {
        return 0.45;
    }
    else if (value >= 35 && value < 45) {
        return 0.60;
    }
    else if (value >= 45 && value < 55) {
        return 0.70;
    }
    else if (value >= 55 && value < 65) {
        return 0.80;
    }
    else if (value >= 65 && value < 80) {
        return 0.90;
    }
    else if (value >= 80 && value < 100) {
        return 0.95;
    }
    else {
        return 1.0;
    }
}

function calculateBoostHpPercentStr(value) {
    if (value < 1) {
        return "Level 0";
    }
    else if (value < 5) {
        return "Level 1";
    }
    else if (value >= 5 && value < 15) {
        return "Level 2";
    }
    else if (value >= 15 && value < 25) {
        return "Level 3";
    }
    else if (value >= 25 && value < 35) {
        return "Level 4";
    }
    else if (value >= 35 && value < 45) {
        return "Level 5";
    }
    else if (value >= 45 && value < 55) {
        return "Level 6";
    }
    else if (value >= 55 && value < 65) {
        return "Level 7";
    }
    else if (value >= 65 && value < 80) {
        return "Level 8";
    }
    else if (value >= 80 && value < 100) {
        return "Level 9";
    }
    else {
        return "Level 10";
    }
}

function calculateBoostHealPercent(value) {
    if (value < 1) {
        return 0;
    }
    else if (value < 5) {
        return 0.05;
    }
    else if (value >= 5 && value < 15) {
        return 0.15;
    }
    else if (value >= 15 && value < 25) {
        return 0.30;
    }
    else if (value >= 25 && value < 35) {
        return 0.45;
    }
    else if (value >= 35 && value < 45) {
        return 0.60;
    }
    else if (value >= 45 && value < 55) {
        return 0.70;
    }
    else if (value >= 55 && value < 65) {
        return 0.80;
    }
    else if (value >= 65 && value < 80) {
        return 0.90;
    }
    else if (value >= 80 && value < 100) {
        return 0.95;
    }
    else {
        return 1.0;
    }
}

function calculateBoostHealPercentStr(value) {
    if (value < 1) {
        return "Level 0";
    }
    else if (value < 5) {
        return "Level 1";
    }
    else if (value >= 5 && value < 15) {
        return "Level 2";
    }
    else if (value >= 15 && value < 25) {
        return "Level 3";
    }
    else if (value >= 25 && value < 35) {
        return "Level 4";
    }
    else if (value >= 35 && value < 45) {
        return "Level 5";
    }
    else if (value >= 45 && value < 55) {
        return "Level 6";
    }
    else if (value >= 55 && value < 65) {
        return "Level 7";
    }
    else if (value >= 65 && value < 80) {
        return "Level 8";
    }
    else if (value >= 80 && value < 100) {
        return "Level 9";
    }
    else {
        return "Level 10";
    }
}

// Calculate Ability Potency %
function calculateAbilityPotPercent(value) {
    if (value < 1) {
        return 0;
    }
    else if (value < 5) {
        return 0.03;
    }
    else if (value >= 5 && value < 15) {
        return 0.08;
    }
    else if (value >= 15 && value < 25) {
        return 0.15;
    }
    else if (value >= 25 && value < 35) {
        return 0.22;
    }
    else if (value >= 35 && value < 45) {
        return 0.30;
    }
    else if (value >= 45 && value < 55) {
        return 0.35;
    }
    else {
        return 0.40;
    }
}

function calculateAbilityPotPercentStr(value) {
    if (value < 1) {
        return "Level 0";
    }
    else if (value < 5) {
        return "Level 1";
    }
    else if (value >= 5 && value < 15) {
        return "Level 2";
    }
    else if (value >= 15 && value < 25) {
        return "Level 3";
    }
    else if (value >= 25 && value < 35) {
        return "Level 4";
    }
    else if (value >= 35 && value < 45) {
        return "Level 5";
    }
    else if (value >= 45 && value < 55) {
        return "Level 6";
    }
    else {
        return "Level 7";
    }
}

// Calculate Physical/Magical Ability Potency %
function calculateAbilityPMPotPercent(value) {
    if (value < 1) {
        return 0;
    }
    else if (value < 5) {
        return 0.05;
    }
    else if (value >= 5 && value < 15) {
        return 0.15;
    }
    else if (value >= 15 && value < 25) {
        return 0.30;
    }
    else if (value >= 25 && value < 35) {
        return 0.45;
    }
    else if (value >= 35 && value < 45) {
        return 0.60;
    }
    else if (value >= 45 && value < 55) {
        return 0.70;
    }
    else {
        return 0.80;
    }
}

function calculateAbilityPMPotPercentStr(value) {
    if (value < 1) {
        return "Level 0";
    }
    else if (value < 5) {
        return "Level 1";
    }
    else if (value >= 5 && value < 15) {
        return "Level 2";
    }
    else if (value >= 15 && value < 25) {
        return "Level 3";
    }
    else if (value >= 25 && value < 35) {
        return "Level 4";
    }
    else if (value >= 35 && value < 45) {
        return "Level 5";
    }
    else if (value >= 45 && value < 55) {
        return "Level 6";
    }
    else {
        return "Level 7";
    }
}


// Calculate Elemental Potency %
function calculateElementalPotPercent(value) {
    if (value < 1) {
        return 0;
    }
    else if (value < 5) {
        return 0.06;
    }
    else if (value >= 5 && value < 15) {
        return 0.15;
    }
    else if (value >= 15 && value < 25) {
        return 0.25;
    }
    else if (value >= 25 && value < 35) {
        return 0.40;
    }
    else if (value >= 35 && value < 45) {
        return 0.55;
    }
    else if (value >= 45 && value < 55) {
        return 0.70;
    }
    else if (value >= 55 && value < 65) {
        return 0.85;
    }
    else if (value >= 65 && value < 80) {
        return 1;
    }
    else if (value >= 80 && value < 100) {
        return 1.1;
    }
    else {
        return 1.2;
    }
}

function calculateElementalPotPercentStr(value) {
    if (value < 1) {
        return "Level 0";
    }
    else if (value < 5) {
        return "Level 1";
    }
    else if (value >= 5 && value < 15) {
        return "Level 2";
    }
    else if (value >= 15 && value < 25) {
        return "Level 3";
    }
    else if (value >= 25 && value < 35) {
        return "Level 4";
    }
    else if (value >= 35 && value < 45) {
        return "Level 5";
    }
    else if (value >= 45 && value < 55) {
        return "Level 6";
    }
    else if (value >= 55 && value < 65) {
        return "Level 7";
    }
    else if (value >= 65 && value < 80) {
        return "Level 8";
    }
    else if (value >= 80 && value < 100) {
        return "Level 9";
    }
    else {
        return "Level 10";
    }
}

function calculateBoostPatkPercent(value) {
    if (value < 1) {
        return 0;
    }
    else if (value < 5) {
        return 0.05;
    }
    else if (value >= 5 && value < 15) {
        return 0.10;
    }
    else if (value >= 15 && value < 25) {
        return 0.15;
    }
    else if (value >= 25 && value < 35) {
        return 0.20;
    }
    else if (value >= 35 && value < 45) {
        return 0.30;
    }
    else if (value >= 45 && value < 55) {
        return 0.40;
    }
    else if (value >= 55) {
        return 0.50;
    }

    return 0;
}

function calculateBoostPatkPercentStr(value) {
    if (value < 1) {
        return "Level 0";
    }
    else if (value < 5) {
        return "Level 1";
    }
    else if (value >= 5 && value < 15) {
        return "Level 2";
    }
    else if (value >= 15 && value < 25) {
        return "Level 3";
    }
    else if (value >= 25 && value < 35) {
        return "Level 4";
    }
    else if (value >= 35 && value < 45) {
        return "Level 5";
    }
    else if (value >= 45 && value < 55) {
        return "Level 6";
    }
    else if (value >= 55) {
        return "Level 7";
    }

    return "Level 0";
}
function calculateBoostAtkAllPercentStr(value) {
    if (value < 1) {
        return "Level 0";
    }
    else if (value < 5) {
        return "Level 1";
    }
    else if (value >= 5 && value < 15) {
        return "Level 2";
    }
        else if (value >= 15 && value < 25) {
        return "Level 3";
    }
    else if (value >= 25 && value < 35) {
        return "Level 4";
    }
    else if (value >= 35 && value < 45) {
        return "Level 5";
    }
    else if (value >= 45 && value < 55) {
        return "Level 6";
    }
    else if (value >= 55) {
        return "Level 7";
    }
    else {
        return "Level 0";
    }
}
function calculateBoostMatkPercent(value) {
    return calculateBoostPatkPercent(value);
}

function calculateBoostAtkPercent(value) {
    if (value < 1) {
        return 0;
    }
    else if (value < 5) {
        return 0.03;
    }
    else if (value >= 5 && value < 15) {
        return 0.05;
    }
    else if (value >= 15 && value < 25) {
        return 0.07;
    }
    else if (value >= 25 && value < 35) {
        return 0.10;
    }
    else if (value >= 35 && value < 45) {
        return 0.15;
    }
    else if (value >= 45 && value < 55) {
        return 0.20;
    }
    else if (value >= 55) {
        return 0.25;
    }

    return 0;
}

function calculateBoostPatkAllPercentStr(value) {
    if (value < 1) {
        return "Level 0";
    }
    else if (value < 5) {
        return "Level 1";
    }
    else if (value >= 5 && value < 15) {
        return "Level 2";
    }
    else if (value >= 15 && value < 25) {
        return "Level 3";
    }
    else if (value >= 25 && value < 35) {
        return "Level 4";
    }
    else if (value >= 35 && value < 45) {
        return "Level 5";
    }
    else if (value >= 45 && value < 55) {
        return "Level 6";
    }
    else {
        return "Level 7";
    }
}

function calculateBoostPatkAllPercent(value) {
    if (value < 1) {
        return 0;
    }
    else if (value < 5) {
        return 0.05;
    }
    else if (value >= 5 && value < 15) {
        return 0.10;
    }
    else if (value >= 15 && value < 25) {
        return 0.14;
    }
    else if (value >= 25 && value < 35) {
        return 0.18;
    }
    else if (value >= 35 && value < 45) {
        return 0.22;
    }
    else if (value >= 45 && value < 55) {
        return 0.25;
    }
    else {
        return 0.28;
    }
}


function calculateBoostMatkAllPercent(value) {
    return calculateBoostPatkAllPercent(value);
}

function calculateBoostAtkAllPercent(value) {
    if (value < 1) {
        return 0;
    }
    else if (value < 5) {
        return 0.03;
    }
    else if (value >= 5 && value < 15) {
        return 0.05;
    }
    else if (value >= 15 && value < 25) {
        return 0.07;
    }
    else if (value >= 25 && value < 35) {
        return 0.09;
    }
    else if (value >= 35 && value < 45) {
        return 0.11;
    }
    else if (value >= 45 && value < 55) {
        return 0.13;
    }
    else if (value >= 55) {
        return 0.14;
    }
    else {
        return 0;
    }
}

function calcExtraAtkFromAtkAll(percent) {
    if (percent < 0.03) {
        return 0;
    }
    else if (percent >= 0.03 && percent < 0.05) {
        return 5;
    }
    else if (percent >= 0.05 && percent < 0.07) {
        return 10;
    }
    else if (percent >= 0.07 && percent < 0.09) {
        return 20;
    }
    else if (percent >= 0.09 && percent < 0.11) {
        return 30;
    }
    else {
        return 30;
    }
}

function calcExtraPatkFromPatkAll( percent) {
    if (percent < 0.05) {
        return 0;
    }
    else if (percent >= 0.05 && percent < 0.10) {
        return 10;
    }
    else if (percent >= 0.10 && percent < 0.14) {
        return 20;
    }
    else if (percent >= 0.14 && percent < 0.18) {
        return 40;
    }
    /*    else if (percent >= 0.18 && percent < 0.22)
        {
            return 60;
        }
        else if (percent >= 0.22 && percent < 0.25)
        {
            return 60;
        }*/
    else {
        return 60;
    }
}

function calculateBoostPdefPercent(value) {
    if (value < 1) {
        return 0;
    }
    else if (value < 5) {
        return 0.05;
    }
    else if (value >= 5 && value < 15) {
        return 0.15;
    }
    else if (value >= 15 && value < 25) {
        return 0.30;
    }
    else if (value >= 25 && value < 35) {
        return 0.45;
    }
    else if (value >= 35 && value < 45) {
        return 0.60;
    }
    else if (value >= 45 && value < 55) {
        return 0.70;
    }
    else {
        return 0.80;
    }
}

function calculateBoostPdefPercentStr(value) {
    if (value < 1) {
        return "Level 0";
    }
    else if (value < 5) {
        return "Level 1";
    }
    else if (value >= 5 && value < 15) {
        return "Level 2";
    }
    else if (value >= 15 && value < 25) {
        return "Level 3";
    }
    else if (value >= 25 && value < 35) {
        return "Level 4";
    }
    else if (value >= 35 && value < 45) {
        return "Level 5";
    }
    else if (value >= 45 && value < 55) {
        return "Level 6";
    }
    else {
        return "Level 7";
    }
}


function calculateBoostMdefPercent(value) {
    return calculateBoostPdefPercent(value);
}

function calcExtraMatkFromPatkAll(percent) {
    return calcExtraPatkFromPatkAll(percent);
}

/*
*    mpatk: magic or physical stat
*    boostMPabilityPercent: magic or physical ability percent
*    boostElementalPercent: the elemental % boost of that weapon
*    enemyDefense: mdef or pdef of the enemy against
*    
*    Basically ignore all resistance and buffs/debuffs. Those belong in the dmg calculator. Here we are only calculating
*    regular damage to see what we should equip
*/
function calculateSkillDamage(mpatk, boostMPabilityPercent, boostAbilityPercent, boostElementalPercent, skillPotency, hwWeapBonus, enemyDefense) {
    var minSkillDamage;
    var maxSkillDamage;
    var basicSkillDamage;


    var skill = 50 * mpatk * skillPotency * (1 + hwWeapBonus) * (1 + STANCE) * (1 + (boostElementalPercent + boostAbilityPercent + boostMPabilityPercent)) / (enemyDefense * 2.2 + 100);
    minSkillDamage = skill * MIN_VARIANCE;
    maxSkillDamage = skill * MAX_VARIANCE;
    basicSkillDamage = Math.floor((minSkillDamage + maxSkillDamage) / 2);

    return basicSkillDamage;

}

function convertElementalXPotencyToElementalPotency(character, elem)
{
    var percent = 0;
    switch (elem) {
        case "Fire":
            percent = calculateElementalPotPercent(character.boostFirePot);
            percent += character.boostFirePotPercent;
            break;
        case "Ice":
            percent = calculateElementalPotPercent(character.boostIcePot);
            percent += character.boostIcePotPercent;
            break;
        case "Lightning":
            percent = calculateElementalPotPercent(character.boostThunderPot);
            percent += character.boostThunderPotPercent;
            break;
        case "Water":
            percent = calculateElementalPotPercent(character.boostWaterPot);
            percent += character.boostWaterPotPercent;
            break;
        case "Wind":
            percent = calculateElementalPotPercent(character.boostWindPot);
            percent += character.boostWindPotPercent;
            break;
        case "Earth":
            percent = calculateElementalPotPercent(character.boostEarthPot);
            percent += character.boostEarthPotPercent;
            break;
        case "Holy":
            break;
        case "Dark":
            break;
        default:
            break;
    }
    return percent;
}