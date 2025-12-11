import { MongoClient, ObjectId } from "mongodb";

//porta di ascolto di mongo demone
const connectionString = "mongodb://127.0.0.1:27017";
const dbname = "unicorns";

async function executeQuery() {
    const client = new MongoClient(connectionString);
    await client.connect().catch(function (err) {
        console.log("Errore di connessione al database");
    });

    const collection = client.db(dbname).collection("unicorns");

    let unicorno = { name: "pluto", residenza: "Fossano" }
    let cmd = collection.insertOne(unicorno)

    cmd?.then(function (data) {
        console.log(data);
        const _id = data.insertedId;
        const newData = {
            "name": "pluto",
            "vampires": 100
        }
        //in questo caso l'unico campo che sopravvive è id, i restanti verranno eliminati e sostituiti con il nuovo json 
        let cmd2 = collection.replaceOne({ "_id": _id }, newData)
        cmd2?.then(function (data) {
            console.log(data);
        });

        cmd2?.catch(function (err) {
            console.log("Errore esecuzione query: " + err.message);
        });
        cmd2?.finally(function () {
            client.close();
        });
    });
    cmd?.catch(function (err) {
        console.log("Errore esecuzione query: " + err.message);
    });
}

executeQuery();