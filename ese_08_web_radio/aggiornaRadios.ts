 import fs from "fs"
 import radios from "./radios.json"
 import states from "./states.json"

 for(const state of states){
    const name = state.name
    const vet = radios.filter(radio => radio.state == name)
    state.stationcount = vet.length.toString();
 }

 fs.writeFile("./states.json", JSON.stringify(states, null, 3), function(){
    console.log("Server aggiornato correttamente")
 })