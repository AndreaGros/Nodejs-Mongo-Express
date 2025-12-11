import { group } from "console";
import { MongoClient, ObjectId } from "mongodb";

//porta di ascolto di mongo demone
const connectionString = "mongodb+srv://admin:admin@cluster0.rnq5bus.mongodb.net/?appName=Cluster0";
const dbname = "aiuole";
async function executeQuery(query: number) {
  const client = new MongoClient(connectionString);
  await client.connect().catch(function (err) {
    console.log("Errore di connessione al databse");
  });
  let collection = client.db(dbname).collection("aiuole");
  let cmd;
  let regex;
  switch (query) {
    case 1:
      cmd = collection.find({ colturaPrincipale: { $in: ["Basilico", "Sedano"] } }).project({ _id: 0, nomeAiuola: 1, colturaPrincipale: 1, sensorePrincipale: 1 }).toArray()
      break;
    case 2:
      // Trovare tutte le aiuole con superficie maggiore o uguale a 15 m2, ordinati in modo decrescente
      // Riportare nome della’aiuola, superficie e parassiti rilevati.
      cmd = collection.find({ superficie: { $gte: 15 } }).sort({ superficie: -1 }).project({ _id: 0, nomeAiuola: 1, superficie: 1, parassitiRilevati: 1 }).toArray()
      break
    case 3:
      // Trovare tutte le aiuole dove tra i parassiti rilevati ci sono sia le lumache che gli acari
      // Riportare nome dell’aiuola e coltura Principale
      cmd = collection.find({ parassitiRilevati: { $all: ["lumache", "acari"] } }).project({ _id: 0, nomeAiuola: 1, colturaPrincipale: 1, parassitiRilevati: 1 }).toArray()
      break
    case 4:
      // Trovare tutte le aiuole della zona Centrale in cui i sensori hanno una percentuale residua di batteria inferiore
      // al 80% , ordinate per superficie decrescente. Riportare nome dell’aiuola, superficie e tutte le
      // informazioni relative al sensore.
      regex = new RegExp("centrale", "i")
      cmd = collection.find(
        { nomeAiuola: regex, "sensorePrincipale.batteria_percent": { $lt: 80 } }
      ).sort(
        { superficie: -1 }
      ).project(
        { _id: 0, nomeAiuola: 1, superficie: 1, sensorePrincipale: 1 }
      ).toArray()
      break
    case 5:
      //Trovare tutte le aiuole della zona nord che hanno almeno una rilevazione giornaliera con umidita maggiore di
      // 40 % e acquaUtilizzata maggiore di 12 litri. Visualizzare il nome dell’aiuola e tutti i dati della singola
      // rilevazione che ha dato match.
      regex = new RegExp("nord", "i")
      cmd = collection.find(
        { nomeAiuola: regex, rilevazioniGiornaliere: { $elemMatch: { umidita: { $gt: 40 }, acquaUtilizzata: { $gt: 12 } } } }
      ).project(
        { _id: 0, nomeAiuola: 1, "rilevazioniGiornaliere.$": 1, }
      ).toArray()
      break
    case 6:
      regex = new RegExp("est-2", "i")
      cmd = collection.updateOne({ nomeAiuola: regex }, { $set: { irrigazioneAutomatica: true } })
      break
    case 7:
      regex = new RegExp("sud", "i")
      cmd = collection.updateMany({ nomeAiuola: regex, parassitiRilevati: { $nin: ['acari'] } }, {
        $addToSet:
        {
          parassitiRilevati:
          {
            $each:
              [
                "acari"
              ]
          }
        },
      })
      break
    case 8:
      // Incrementa di 2 litri l’acqua utilizzata in tutte le rilevazioni giornaliere dell’aiuola "aiuola centrale-1".
      regex = new RegExp("^aiuola centrale-1$", "i")
      cmd = collection.updateOne({ nomeAiuola: regex }, { $inc: { "rilevazioniGiornaliere.$[].acquaUtilizzata": 2 } })
      break
    case 9:
      // Per ciascuna coltura principale trovare il numero di aiuole coltivate con quella coltura e la somma complessiva
      // dei metri quadri di tutte le aiuole adibite a quella coltura, ordinate in ordine di metri quadrati complessivi
      // decrescenti
      cmd = collection.aggregate([
        {
          $group: {
            _id: "$colturaPrincipale",
            nAiuole: {
              $sum: 1,
            },
            sommaAree: {
              $sum: "$superficie"
            }
          },
        },
        {
          $sort: {
            sommaAree: -1, //decrescente
          },
        }
      ]).toArray()
      break
    case 10:
      // Trovare la media di acqua utilizzata fra TUTTE le rilevazioni Giornaliere relativamente a TUTTE le aiuole in
      // cui sono coltivati i "Pomodori".
      cmd = collection.aggregate([
        { $match: { colturaPrincipale: "Pomodori" } },
        { $unwind: "$rilevazioniGiornaliere" },
        {
          $project: {
            _id: "$colturaPrincipale",
          }
        },
        { $group: { _id: "$_id", media: { $avg: "$acquaUtilizzata" } } }
      ]).toArray()
      break
  }
  cmd?.then(function (data) {
    console.log(JSON.stringify(data, null, 2));
    if (data instanceof Array) {
      console.log("Numero record trovati: " + data.length);
    }
  });
  cmd?.catch(function (err) {
    console.log("Errore esecuzione query: " + err.message);
  });
  cmd?.finally(function () {
    client.close();
  });
}

executeQuery(10);