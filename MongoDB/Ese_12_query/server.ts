import { MongoClient, ObjectId } from "mongodb";

const connectionString = "mongodb://127.0.0.1:27017"
const dbName = "unicorns"

const query = 4
executeQuery(query)

async function executeQuery(query: number) {
    const client = new MongoClient(connectionString)
    await client.connect().catch(function (err) {
        console.log("Errore connessione db")
    })
    console.log("prova")
    const collection = client.db(dbName).collection("unicorns")
    let cmd
    switch (query) {
        case 1:
            cmd = collection.find({ "weight": { $gte: 700, $lte: 800 } }).toArray()
            break
        case 2:
            // cmd = collection.find({"gender": "m", "loves":"grape", "vampires":{$gt:60}}).toArray()
            cmd = collection.find({ $and: [{ gender: "m" }, { loves: "grape" }, { vampires: { $gte: 60 } }] }).toArray()
            break
        case 3:
            cmd = collection.find({ $or: [{ gender: "f" }, { weight: { $lte: 700 } }] }).toArray()
            break
        case 4:
            // cmd = collection.find({
            //     $and: [
            //         {
            //             $or: [
            //                 { loves: "apple" },
            //                 { loves: "grape" }
            //             ]
            //         },
            //         { vampires: { $gte: 60 } }
            //     ]
            // }).toArray()
            cmd = collection.find({
                loves: { $in: ["apple", "grape"] },
                vampires: { $gte: 60 }
            }).toArray()
            break
        case 5:
            cmd = collection.find({
                loves: { $all: ["grape", "watermelon"] },
                vampires: { $gte: 60 }
            }).toArray()
            break
        case 6:
            cmd = collection.find({
                hair: { $in: ["grey", "brown"] }
            }).toArray()
            break
        case 7:
            cmd = collection.find({
                $or: [{ vaccinated: false }, { vaccinated: { exists: false } }]
            }).toArray()
            break
        case 8:
            cmd = collection.find({
                gender: "m", loves: { $nin: ["apple"] }
            }).toArray()
            break
        case 9:
            const regex = new RegExp("^[aA]")
            cmd = collection.find({
                gender: "f", name: regex
            }).toArray()
            break
        case 10:
            let objectId = new ObjectId("68fa12c206a9ede085af187a")
            cmd = collection.find({
                _id: objectId
            }).toArray()
            break
        case 11:
            cmd = collection.find({
                gender: "M"
            }).project({ name: 1, vampires: 1, _id: 0 }).limit(3).sort({ vampires: -1, nome: 1 }).toArray()
            break

    }
    cmd?.then(function (data) {
        console.log(data)
    })
    cmd?.catch(function (err) {
        console.log("Errore esecuzione query: " + err.message)
    })
    cmd?.finally(function () {
        client.close()
    })
}