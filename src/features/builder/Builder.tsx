import {
  Card,
  Elevation,
  H4,
  Icon,
  ButtonGroup,
  Button,
  Tag,
  H5,
  Classes,
} from "@blueprintjs/core";
import React from "react";

function CharCard({
  character,
  artifacts,
  weapon,
}: {
  character: ICharacter;
  artifacts: IArtifact[];
  weapon: IWeapon | undefined;
}) {
  //figure out sets and add up subs
  let sets: { [key: string]: number } = {};
  let subs: { [key: string]: number } = {};

  let sands: string = "none",
    gob: string = "none",
    circlet: string = "none";

  artifacts.forEach((a) => {
    if (a.setKey in sets) {
      sets[a.setKey]++;
    } else {
      sets[a.setKey] = 1;
    }

    a.substats.forEach((s) => {
      if (s.key in subs) {
        subs[s.key] += s.value;
      } else {
        subs[s.key] = s.value;
      }
    });

    switch (a.slotKey) {
      case "sands":
        sands = statMap[a.mainStatKey];
        break;
      case "goblet":
        gob = statMap[a.mainStatKey];
        break;
      case "circlet":
        circlet = statMap[a.mainStatKey];
        break;
    }
  });

  let setTwo: JSX.Element[] = [];
  let setFour: JSX.Element[] = [];

  Object.keys(sets).forEach((k) => {
    if (sets[k] >= 2) {
      setTwo.push(<div key={k}>{k}</div>);
    }
    if (sets[k] == 4) {
      setFour.push(<div key={k}>{k}</div>);
    }
  });

  let dmgSubRows: JSX.Element[] = [];
  let miscSubRows: JSX.Element[] = [];

  dmgSubs.forEach((k) => {
    if (k in subs) {
      let val = subs[k];
      if (k.includes("_")) {
        val = val / 100;
      }
      dmgSubRows.push(
        <div className="row" key={k}>
          <span className="col-xs">{statMap[k]}</span>
          <span className="col-xs" style={{ textAlign: "right" }}>
            {val.toLocaleString()}
          </span>
        </div>
      );
    }
  });

  miscSubs.forEach((k) => {
    if (k in subs) {
      let val = subs[k];
      if (k.includes("_")) {
        val = val / 100;
      }
      miscSubRows.push(
        <div className="row" key={k}>
          <span className="col-xs">{statMap[k]}</span>
          <span className="col-xs" style={{ textAlign: "right" }}>
            {val.toLocaleString()}
          </span>
        </div>
      );
    }
  });

  return (
    <Card elevation={Elevation.THREE} style={{ height: "100%" }}>
      <div className="row end-xs">
        <div className="col-xs"></div>
      </div>

      <div className="row">
        <span className="col-xs">
          <H4>{character.key}</H4>
          {"Lvl " +
            character.level +
            "/" +
            ascMax[character.ascension] +
            " C" +
            character.constellation +
            " T:" +
            character.talent.auto +
            "/" +
            character.talent.skill +
            "/" +
            character.talent.burst}
        </span>
        <span className="col-xs" style={{ textAlign: "right" }}>
          <ButtonGroup>
            <Button icon="edit" />
            <Button icon="trash" intent="danger" />
          </ButtonGroup>
        </span>
      </div>
      <div className="row center-xs">
        <div className="col-xs">
          <img
            src={
              process.env.PUBLIC_URL +
              "/assets/UI_AvatarIcon_" +
              character.key +
              ".png"
            }
            alt={character.key}
            style={{ width: "70%" }}
          />
        </div>
        {/* <div className="col-xs">

        </div> */}
      </div>
      <div className="row">
        <div className="col-xs">
          <H5>Equipment: </H5>
          {weapon === undefined ? (
            "None"
          ) : (
            <div>
              <div>{weapon.key}</div>
              <div>{"Lvl " + weapon.level + " R" + weapon.refinement}</div>
            </div>
          )}
          <br />
          {setTwo.length == 0 ? null : (
            <div>
              <b>2 Piece:</b>
              {setTwo}
              <br />
            </div>
          )}
          {setFour.length == 0 ? null : (
            <div>
              <b>4 Piece:</b>
              {setFour}
            </div>
          )}
        </div>
        <div className="col-xs">
          <H5>Stats: </H5>
          <b>Main</b>
          <br />
          {sands + " / " + gob + " / " + circlet}
          <br />
          <br />
          <b>Subs</b>
          <br />
          {dmgSubRows}
          {miscSubRows}
        </div>
      </div>
    </Card>
  );
}

function Builder() {
  const [chars, setChars] = React.useState<ICharacter[] | undefined>(
    testInput.characters
  );
  const [artifacts, setArtifacts] = React.useState<IArtifact[] | undefined>(
    testInput.artifacts
  );
  const [weapons, setWeapons] = React.useState<IWeapon[] | undefined>(
    testInput.weapons
  );

  let cards: JSX.Element[] = [];

  if (chars !== undefined) {
    chars.forEach((c, i) => {
      //find the list of artifacts and weapons equipped by this char
      let ca: IArtifact[] = [];

      if (artifacts !== undefined) {
        artifacts.forEach((art) => {
          if (art.location === c.key) {
            ca.push(art);
          }
        });
      }

      let w: IWeapon | undefined;

      if (weapons !== undefined) {
        w = weapons.find((weap) => weap.location === c.key);
      }

      cards.push(
        <div className="col-xs-12 col-sm-6 col-md-6 col-lg-3" key={i}>
          <div
            className="box"
            style={{
              height: "100%",
              marginTop: "10px",
              marginLeft: "20px",
              marginRight: "10px",
            }}
          >
            <CharCard character={c} artifacts={ca} weapon={w} />
          </div>
        </div>
      );
    });
  }

  return (
    <div className="row" style={{ marginLeft: "10px", marginRight: "10px" }}>
      {cards}
    </div>
  );
}

export default Builder;

interface IGOOD {
  format: "GOOD"; //A way for people to recognize this format.
  version: number; //API version.
  source: string; //the app that generates this data.
  characters?: ICharacter[];
  artifacts?: IArtifact[];
  weapons?: IWeapon[];
}

interface ICharacter {
  key: CharacterKey; //e.g. "Rosaria"
  level: number; //1-90 inclusive
  constellation: number; //0-6 inclusive
  ascension: number; //0-6 inclusive. need to disambiguate 80/90 or 80/80
  talent: {
    //does not include boost from constellations. 1-15 inclusive
    auto: number;
    skill: number;
    burst: number;
  };
}

interface IWeapon {
  key: WeaponKey; //"CrescentPike"
  level: number; //1-90 inclusive
  ascension: number; //0-6 inclusive. need to disambiguate 80/90 or 80/80
  refinement: number; //1-5 inclusive
  location: CharacterKey | ""; //where "" means not equipped.
}

interface IArtifact {
  setKey: ArtifactSetKey; //e.g. "GladiatorsFinale"
  slotKey: SlotKey; //e.g. "plume"
  level: number; //0-20 inclusive
  rarity: number; //1-5 inclusive
  mainStatKey: StatKey;
  location: CharacterKey | ""; //where "" means not equipped.
  lock: boolean; //Whether the artifact is locked in game.
  substats: ISubstat[];
}

interface ISubstat {
  key: StatKey; //e.g. "critDMG_"
  value: number; //e.g. 19.4
}

type SlotKey = "flower" | "plume" | "sands" | "goblet" | "circlet";

const dmgSubs: StatKey[] = ["atk", "atk_", "critRate_", "critDMG_"];

const miscSubs: StatKey[] = ["eleMas", "enerRech_", "hp", "hp_", "def", "def_"];

const ascMax: number[] = [20, 40, 50, 60, 70, 80, 90];

const statMap: { [key in string]: string } = {
  hp: "hp",
  hp_: "hp%",
  atk: "atk",
  atk_: "atk%",
  def: "def",
  def_: "def%",
  eleMas: "em",
  enerRech_: "er",
  heal_: "heal",
  critRate_: "cr",
  critDMG_: "cd",
  physical_dmg_: "phys%",
  anemo_dmg_: "anemo%",
  geo_dmg_: "geo%",
  electro_dmg_: "electro%",
  hydro_dmg_: "hydro%",
  pyro_dmg_: "pyro%",
  cryo_dmg_: "cryo%",
};

type StatKey =
  | "hp" //HP
  | "hp_" //HP%
  | "atk" //ATK
  | "atk_" //ATK%
  | "def" //DEF
  | "def_" //DEF%
  | "eleMas" //Elemental Mastery
  | "enerRech_" //Energy Recharge%
  | "heal_" //Healing Bonus%
  | "critRate_" //CRIT Rate%
  | "critDMG_" //CRIT DMG%
  | "physical_dmg_" //Physical DMG Bonus%
  | "anemo_dmg_" //Anemo DMG Bonus%
  | "geo_dmg_" //Geo DMG Bonus%
  | "electro_dmg_" //Electro DMG Bonus%
  | "hydro_dmg_" //Hydro DMG Bonus%
  | "pyro_dmg_" //Pyro DMG Bonus%
  | "cryo_dmg_"; //Cryo DMG Bonus%

type ArtifactSetKey =
  | "Adventurer" //Adventurer
  | "ArchaicPetra" //Archaic Petra
  | "Berserker" //Berserker
  | "BlizzardStrayer" //Blizzard Strayer
  | "BloodstainedChivalry" //Bloodstained Chivalry
  | "BraveHeart" //Brave Heart
  | "CrimsonWitchOfFlames" //Crimson Witch of Flames
  | "DefendersWill" //Defender's Will
  | "EmblemOfSeveredFate" //Emblem of Severed Fate
  | "Gambler" //Gambler
  | "GladiatorsFinale" //Gladiator's Finale
  | "HeartOfDepth" //Heart of Depth
  | "Instructor" //Instructor
  | "Lavawalker" //Lavawalker
  | "LuckyDog" //Lucky Dog
  | "MaidenBeloved" //Maiden Beloved
  | "MartialArtist" //Martial Artist
  | "NoblesseOblige" //Noblesse Oblige
  | "PaleFlame" //Pale Flame
  | "PrayersForDestiny" //Prayers for Destiny
  | "PrayersForIllumination" //Prayers for Illumination
  | "PrayersForWisdom" //Prayers for Wisdom
  | "PrayersToSpringtime" //Prayers to Springtime
  | "ResolutionOfSojourner" //Resolution of Sojourner
  | "RetracingBolide" //Retracing Bolide
  | "Scholar" //Scholar
  | "ShimenawasReminiscence" //Shimenawa's Reminiscence
  | "TenacityOfTheMillelith" //Tenacity of the Millelith
  | "TheExile" //The Exile
  | "ThunderingFury" //Thundering Fury
  | "Thundersoother" //Thundersoother
  | "TinyMiracle" //Tiny Miracle
  | "TravelingDoctor" //Traveling Doctor
  | "ViridescentVenerer" //Viridescent Venerer
  | "WanderersTroupe"; //Wanderer's Troupe

type CharacterKey =
  | "Albedo" //Albedo
  | "Aloy" //Aloy
  | "Amber" //Amber
  | "Barbara" //Barbara
  | "Beidou" //Beidou
  | "Bennett" //Bennett
  | "Chongyun" //Chongyun
  | "Diluc" //Diluc
  | "Diona" //Diona
  | "Eula" //Eula
  | "Fischl" //Fischl
  | "Ganyu" //Ganyu
  | "HuTao" //Hu Tao
  | "Jean" //Jean
  | "KaedeharaKazuha" //Kaedehara Kazuha
  | "Kaeya" //Kaeya
  | "KamisatoAyaka" //Kamisato Ayaka
  | "Keqing" //Keqing
  | "Klee" //Klee
  | "KujouSara" //Kujou Sara
  | "Lisa" //Lisa
  | "Mona" //Mona
  | "Ningguang" //Ningguang
  | "Noelle" //Noelle
  | "Qiqi" //Qiqi
  | "RaidenShogun" //Raiden Shogun
  | "Razor" //Razor
  | "Rosaria" //Rosaria
  | "SangonomiyaKokomi" //Sangonomiya Kokomi
  | "Sayu" //Sayu
  | "Sucrose" //Sucrose
  | "Tartaglia" //Tartaglia
  | "Traveler" //Traveler
  | "Venti" //Venti
  | "Xiangling" //Xiangling
  | "Xiao" //Xiao
  | "Xingqiu" //Xingqiu
  | "Xinyan" //Xinyan
  | "Yanfei" //Yanfei
  | "Yoimiya" //Yoimiya
  | "Zhongli"; //Zhongli

type WeaponKey =
  | "AlleyHunter" //Alley Hunter
  | "AmenomaKageuchi" //Amenoma Kageuchi
  | "AmosBow" //Amos' Bow
  | "ApprenticesNotes" //Apprentice's Notes
  | "AquilaFavonia" //Aquila Favonia
  | "BeginnersProtector" //Beginner's Protector
  | "BlackTassel" //Black Tassel
  | "BlackcliffAgate" //Blackcliff Agate
  | "BlackcliffLongsword" //Blackcliff Longsword
  | "BlackcliffPole" //Blackcliff Pole
  | "BlackcliffSlasher" //Blackcliff Slasher
  | "BlackcliffWarbow" //Blackcliff Warbow
  | "BloodtaintedGreatsword" //Bloodtainted Greatsword
  | "CompoundBow" //Compound Bow
  | "CoolSteel" //Cool Steel
  | "CrescentPike" //Crescent Pike
  | "DarkIronSword" //Dark Iron Sword
  | "Deathmatch" //Deathmatch
  | "DebateClub" //Debate Club
  | "DodocoTales" //Dodoco Tales
  | "DragonsBane" //Dragon's Bane
  | "DragonspineSpear" //Dragonspine Spear
  | "DullBlade" //Dull Blade
  | "EbonyBow" //Ebony Bow
  | "ElegyForTheEnd" //Elegy for the End
  | "EmeraldOrb" //Emerald Orb
  | "EngulfingLightning" //Engulfing Lightning
  | "EverlastingMoonglow" //Everlasting Moonglow
  | "EyeOfPerception" //Eye of Perception
  | "FavoniusCodex" //Favonius Codex
  | "FavoniusGreatsword" //Favonius Greatsword
  | "FavoniusLance" //Favonius Lance
  | "FavoniusSword" //Favonius Sword
  | "FavoniusWarbow" //Favonius Warbow
  | "FerrousShadow" //Ferrous Shadow
  | "FesteringDesire" //Festering Desire
  | "FilletBlade" //Fillet Blade
  | "FreedomSworn" //Freedom-Sworn
  | "Frostbearer" //Frostbearer
  | "HakushinRing" //Hakushin Ring
  | "Halberd" //Halberd
  | "Hamayumi" //Hamayumi
  | "HarbingerOfDawn" //Harbinger of Dawn
  | "HuntersBow" //Hunter's Bow
  | "IronPoint" //Iron Point
  | "IronSting" //Iron Sting
  | "KatsuragikiriNagamasa" //Katsuragikiri Nagamasa
  | "KitainCrossSpear" //Kitain Cross Spear
  | "LionsRoar" //Lion's Roar
  | "LithicBlade" //Lithic Blade
  | "LithicSpear" //Lithic Spear
  | "LostPrayerToTheSacredWinds" //Lost Prayer to the Sacred Winds
  | "LuxuriousSeaLord" //Luxurious Sea-Lord
  | "MagicGuide" //Magic Guide
  | "MappaMare" //Mappa Mare
  | "MemoryOfDust" //Memory of Dust
  | "Messenger" //Messenger
  | "MistsplitterReforged" //Mistsplitter Reforged
  | "MitternachtsWaltz" //Mitternachts Waltz
  | "OldMercsPal" //Old Merc's Pal
  | "OtherworldlyStory" //Otherworldly Story
  | "PocketGrimoire" //Pocket Grimoire
  | "Predator" //Predator
  | "PrimordialJadeCutter" //Primordial Jade Cutter
  | "PrimordialJadeWingedSpear" //Primordial Jade Winged-Spear
  | "PrototypeAmber" //Prototype Amber
  | "PrototypeArchaic" //Prototype Archaic
  | "PrototypeCrescent" //Prototype Crescent
  | "PrototypeRancour" //Prototype Rancour
  | "PrototypeStarglitter" //Prototype Starglitter
  | "Quartz" //Quartz
  | "Rainslasher" //Rainslasher
  | "RavenBow" //Raven Bow
  | "RecurveBow" //Recurve Bow
  | "RoyalBow" //Royal Bow
  | "RoyalGreatsword" //Royal Greatsword
  | "RoyalGrimoire" //Royal Grimoire
  | "RoyalLongsword" //Royal Longsword
  | "RoyalSpear" //Royal Spear
  | "Rust" //Rust
  | "SacrificialBow" //Sacrificial Bow
  | "SacrificialFragments" //Sacrificial Fragments
  | "SacrificialGreatsword" //Sacrificial Greatsword
  | "SacrificialSword" //Sacrificial Sword
  | "SeasonedHuntersBow" //Seasoned Hunter's Bow
  | "SerpentSpine" //Serpent Spine
  | "SharpshootersOath" //Sharpshooter's Oath
  | "SilverSword" //Silver Sword
  | "SkyriderGreatsword" //Skyrider Greatsword
  | "SkyriderSword" //Skyrider Sword
  | "SkywardAtlas" //Skyward Atlas
  | "SkywardBlade" //Skyward Blade
  | "SkywardHarp" //Skyward Harp
  | "SkywardPride" //Skyward Pride
  | "SkywardSpine" //Skyward Spine
  | "Slingshot" //Slingshot
  | "SnowTombedStarsilver" //Snow-Tombed Starsilver
  | "SolarPearl" //Solar Pearl
  | "SongOfBrokenPines" //Song of Broken Pines
  | "StaffOfHoma" //Staff of Homa
  | "SummitShaper" //Summit Shaper
  | "SwordOfDescension" //Sword of Descension
  | "TheAlleyFlash" //The Alley Flash
  | "TheBell" //The Bell
  | "TheBlackSword" //The Black Sword
  | "TheCatch" //"The Catch"
  | "TheFlute" //The Flute
  | "TheStringless" //The Stringless
  | "TheUnforged" //The Unforged
  | "TheViridescentHunt" //The Viridescent Hunt
  | "TheWidsith" //The Widsith
  | "ThrillingTalesOfDragonSlayers" //Thrilling Tales of Dragon Slayers
  | "ThunderingPulse" //Thundering Pulse
  | "TravelersHandySword" //Traveler's Handy Sword
  | "TwinNephrite" //Twin Nephrite
  | "VortexVanquisher" //Vortex Vanquisher
  | "WasterGreatsword" //Waster Greatsword
  | "WhiteIronGreatsword" //White Iron Greatsword
  | "WhiteTassel" //White Tassel
  | "Whiteblind" //Whiteblind
  | "WindblumeOde" //Windblume Ode
  | "WineAndSong" //Wine and Song
  | "WolfsGravestone"; //Wolf's Gravestone

const testInput: IGOOD = {
  format: "GOOD",
  source: "Genshin Optimizer",
  version: 1,
  characters: [
    {
      key: "Xingqiu",
      level: 90,
      ascension: 6,
      talent: { auto: 1, skill: 9, burst: 10 },
      constellation: 6,
    },
    {
      key: "RaidenShogun",
      level: 90,
      ascension: 6,
      talent: { auto: 6, skill: 8, burst: 9 },
      constellation: 1,
    },
    {
      key: "Xiangling",
      level: 80,
      ascension: 6,
      talent: { auto: 6, skill: 6, burst: 10 },
      constellation: 6,
    },
    {
      key: "Ganyu",
      level: 90,
      ascension: 6,
      talent: { auto: 10, skill: 6, burst: 10 },
      constellation: 1,
    },
  ],
  artifacts: [
    {
      setKey: "GladiatorsFinale",
      rarity: 5,
      level: 20,
      slotKey: "plume",
      mainStatKey: "atk",
      lock: false,
      substats: [
        { key: "critDMG_", value: 21.8 },
        { key: "def", value: 19 },
        { key: "atk_", value: 11.7 },
        { key: "eleMas", value: 40 },
      ],
      location: "Xingqiu",
    },
    {
      setKey: "MaidenBeloved",
      rarity: 5,
      level: 20,
      slotKey: "goblet",
      mainStatKey: "electro_dmg_",
      lock: false,
      substats: [
        { key: "critRate_", value: 11.7 },
        { key: "atk", value: 19 },
        { key: "def_", value: 7.3 },
        { key: "critDMG_", value: 19.4 },
      ],
      location: "RaidenShogun",
    },
    {
      setKey: "EmblemOfSeveredFate",
      rarity: 5,
      level: 20,
      slotKey: "flower",
      mainStatKey: "hp",
      lock: false,
      substats: [
        { key: "hp_", value: 4.1 },
        { key: "critDMG_", value: 17.1 },
        { key: "atk_", value: 4.7 },
        { key: "critRate_", value: 10.1 },
      ],
      location: "RaidenShogun",
    },
    {
      setKey: "EmblemOfSeveredFate",
      rarity: 5,
      level: 20,
      slotKey: "plume",
      mainStatKey: "atk",
      lock: false,
      substats: [
        { key: "def", value: 35 },
        { key: "critDMG_", value: 14 },
        { key: "eleMas", value: 35 },
        { key: "critRate_", value: 7 },
      ],
      location: "RaidenShogun",
    },
    {
      setKey: "MaidenBeloved",
      rarity: 5,
      level: 20,
      slotKey: "goblet",
      mainStatKey: "pyro_dmg_",
      lock: false,
      substats: [
        { key: "critRate_", value: 8.9 },
        { key: "enerRech_", value: 5.2 },
        { key: "atk_", value: 9.3 },
        { key: "atk", value: 43 },
      ],
      location: "Xiangling",
    },
    {
      setKey: "ArchaicPetra",
      rarity: 5,
      level: 20,
      slotKey: "circlet",
      mainStatKey: "critRate_",
      lock: false,
      substats: [
        { key: "critDMG_", value: 6.2 },
        { key: "atk_", value: 19.2 },
        { key: "hp_", value: 8.2 },
        { key: "atk", value: 39 },
      ],
      location: "Xingqiu",
    },
    {
      setKey: "EmblemOfSeveredFate",
      rarity: 5,
      level: 20,
      slotKey: "circlet",
      mainStatKey: "critRate_",
      lock: false,
      substats: [
        { key: "def_", value: 13.1 },
        { key: "atk_", value: 11.1 },
        { key: "enerRech_", value: 11.7 },
        { key: "hp_", value: 8.7 },
      ],
      location: "RaidenShogun",
    },
    {
      setKey: "NoblesseOblige",
      rarity: 5,
      level: 20,
      slotKey: "sands",
      mainStatKey: "atk_",
      lock: false,
      substats: [
        { key: "def", value: 53 },
        { key: "hp", value: 299 },
        { key: "critRate_", value: 6.2 },
        { key: "critDMG_", value: 13.2 },
      ],
      location: "Xingqiu",
    },
    {
      setKey: "BlizzardStrayer",
      rarity: 5,
      level: 20,
      slotKey: "flower",
      mainStatKey: "hp",
      lock: false,
      substats: [
        { key: "eleMas", value: 21 },
        { key: "atk", value: 47 },
        { key: "critDMG_", value: 17.9 },
        { key: "def", value: 19 },
      ],
      location: "Ganyu",
    },
    {
      setKey: "BlizzardStrayer",
      rarity: 5,
      level: 20,
      slotKey: "circlet",
      mainStatKey: "critDMG_",
      lock: false,
      substats: [
        { key: "critRate_", value: 9.7 },
        { key: "def", value: 21 },
        { key: "atk_", value: 14 },
        { key: "def_", value: 6.6 },
      ],
      location: "Ganyu",
    },
    {
      setKey: "NoblesseOblige",
      rarity: 5,
      level: 20,
      slotKey: "flower",
      mainStatKey: "hp",
      lock: false,
      substats: [
        { key: "def", value: 44 },
        { key: "enerRech_", value: 6.5 },
        { key: "critRate_", value: 9.7 },
        { key: "critDMG_", value: 12.4 },
      ],
      location: "Xingqiu",
    },
    {
      setKey: "GladiatorsFinale",
      rarity: 5,
      level: 20,
      slotKey: "sands",
      mainStatKey: "atk_",
      lock: false,
      substats: [
        { key: "critDMG_", value: 12.4 },
        { key: "critRate_", value: 7.8 },
        { key: "hp", value: 209 },
        { key: "atk", value: 51 },
      ],
      location: "Xiangling",
    },
    {
      setKey: "GladiatorsFinale",
      rarity: 5,
      level: 20,
      slotKey: "circlet",
      mainStatKey: "critRate_",
      lock: false,
      substats: [
        { key: "atk_", value: 8.7 },
        { key: "hp_", value: 5.8 },
        { key: "critDMG_", value: 13.2 },
        { key: "def", value: 76 },
      ],
      location: "Xiangling",
    },
    {
      setKey: "GladiatorsFinale",
      rarity: 5,
      level: 20,
      slotKey: "goblet",
      mainStatKey: "hydro_dmg_",
      lock: false,
      substats: [
        { key: "critDMG_", value: 20.2 },
        { key: "atk_", value: 14 },
        { key: "hp", value: 299 },
        { key: "atk", value: 39 },
      ],
      location: "Xingqiu",
    },
    {
      setKey: "CrimsonWitchOfFlames",
      rarity: 5,
      level: 20,
      slotKey: "plume",
      mainStatKey: "atk",
      lock: false,
      substats: [
        { key: "def", value: 37 },
        { key: "def_", value: 5.1 },
        { key: "critRate_", value: 9.7 },
        { key: "critDMG_", value: 21.8 },
      ],
      location: "Xiangling",
    },
    {
      setKey: "CrimsonWitchOfFlames",
      rarity: 5,
      level: 20,
      slotKey: "goblet",
      mainStatKey: "cryo_dmg_",
      lock: false,
      substats: [
        { key: "critDMG_", value: 7 },
        { key: "critRate_", value: 9.3 },
        { key: "hp", value: 717 },
        { key: "def", value: 16 },
      ],
      location: "Ganyu",
    },
    {
      setKey: "BlizzardStrayer",
      rarity: 5,
      level: 20,
      slotKey: "sands",
      mainStatKey: "atk_",
      lock: false,
      substats: [
        { key: "atk", value: 31 },
        { key: "critDMG_", value: 22.5 },
        { key: "hp_", value: 4.7 },
        { key: "enerRech_", value: 16.8 },
      ],
      location: "Ganyu",
    },
    {
      setKey: "CrimsonWitchOfFlames",
      rarity: 5,
      level: 20,
      slotKey: "flower",
      mainStatKey: "hp",
      lock: false,
      substats: [
        { key: "hp_", value: 4.7 },
        { key: "atk_", value: 15.2 },
        { key: "eleMas", value: 21 },
        { key: "critDMG_", value: 26.4 },
      ],
      location: "Xiangling",
    },
    {
      setKey: "BlizzardStrayer",
      rarity: 5,
      level: 20,
      slotKey: "plume",
      mainStatKey: "atk",
      lock: false,
      substats: [
        { key: "critDMG_", value: 6.2 },
        { key: "eleMas", value: 35 },
        { key: "atk_", value: 15.7 },
        { key: "critRate_", value: 7 },
      ],
      location: "Ganyu",
    },
    {
      setKey: "EmblemOfSeveredFate",
      rarity: 5,
      level: 20,
      slotKey: "sands",
      mainStatKey: "enerRech_",
      lock: false,
      substats: [
        { key: "atk", value: 14 },
        { key: "critDMG_", value: 20.2 },
        { key: "eleMas", value: 70 },
        { key: "hp", value: 299 },
      ],
      location: "RaidenShogun",
    },
  ],
  weapons: [
    {
      key: "EngulfingLightning",
      level: 90,
      ascension: 6,
      refinement: 1,
      location: "RaidenShogun",
    },
    {
      key: "SacrificialSword",
      level: 90,
      ascension: 6,
      refinement: 1,
      location: "Xingqiu",
    },
    {
      key: "AmosBow",
      level: 90,
      ascension: 6,
      refinement: 1,
      location: "Ganyu",
    },
    {
      key: "SkywardSpine",
      level: 90,
      ascension: 6,
      refinement: 1,
      location: "Xiangling",
    },
  ],
};
