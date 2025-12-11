import { MongoClient, MongoError } from "mongodb";
import fs from "fs";

const atlasConnectionString = "mongodb+srv://admin:admin@cluster0.rnq5bus.mongodb.net/?appName=Cluster0" 

if (!process.argv[2]) {
  console.error("Uso: ts-node import.ts collectionName>");
  process.exit(1);
}

const connectionString: string = "mongodb://127.0.0.1:27017";
const dbName: string = process.argv[2];
const collectionName = process.argv[2];
const fileName = process.argv[2] + ".json"

const json = JSON.parse(fs.readFileSync(fileName, "utf-8"));
upload()

async function upload(){
	const client = new MongoClient(atlasConnectionString);
	await client.connect().catch(function(err: MongoError) {
			console.log("Errore di connessione al database: " + err.message);
	});
	const collection = client.db(dbName).collection(collectionName);
	let cmd = collection.insertMany(json);
	cmd?.then(function(data) {
        console.log(JSON.stringify(data, null, 3));
        console.log("Importati " + data.insertedCount + " documenti");
    })
    cmd?.catch(function(err: MongoError) {
        console.log("Errore import: " + err.message);
    });
    cmd?.finally(function() {
        client.close();
    });
}

