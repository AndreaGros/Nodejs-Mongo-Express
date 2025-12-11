import { MongoClient, ObjectId } from "mongodb";

//porta di ascolto di mongo demone
const connectionString = "mongodb://127.0.0.1:27017";
const dbname = "5BInfo";

const query = 25;

async function executeQuery(query: number) {
  const client = new MongoClient(connectionString);
  await client.connect().catch(function (err) {
    console.log("Errore di connessione al databse");
  });
  let collection;
  let cmd;
  let regex;
  switch (query) {
    //Trovare tutti i libri posizionati nella stanza 2, scaffale 3.
    case 24:
      collection = client.db(dbname).collection("biblioteca");
      //CON JSON QUANDO SCRIVO PUNTINO METTERE TUTTO IN STRINGA
      cmd = collection
        .find({ "posizione.stanza": 2, "posizione.scaffale": 3 })
        .project({
          titolo: 1,
          autore: 1,
          posizione: 1,
          pubblicazione: 1,
          _id: 0,
        })
        .toArray();
      break;
    //25) Elenco della case editrici presenti nella biblioteca, ognuna ripetuta una sola volta
    case 25:
      collection = client.db(dbname).collection("biblioteca");
      //prende tutti gli editori dentro pubblicazioni una sola volta
      cmd = collection.distinct("pubblicazioni.editore");
      break;
    /*26) Elenco di tutti i libri pubblicati dalla einaudi (scritto in formato case insensitive). 
        Visualizzare titolo,  autore ed elenco di TUTTE le pubblicazioni ognuna con il solo campo editore */
    case 26:
      collection = client.db(dbname).collection("biblioteca");
      //tutti editori/stringhe che contengono einaudi
      //se no se faccio ^einaudi$ tutte le stringhe che contangono ESATTAMENTE "einaudi"
      regex = new RegExp("einaudi", "i");
      cmd = collection.find({ "pubblicazioni.editore": regex }).toArray();
      break;
    /*27) Elenco di tutti i libri pubblicati dalla einaudi (scritto in formato case insensitive) nel 2010 
        Visualizzare titolo,  autore ed elenco di TUTTE le pubblicazioni ognuna con i soli campi editore e anno*/
    case 27:
      collection = client.db(dbname).collection("biblioteca");
      regex = new RegExp("einaudi", "i");
      //elemMatch si usa qunado ho un vettore di JSON, quando ho più codizioni sul vettore di JSON
      //e voglio che vengano tutte applicate sullo stesso record
      //APPLICARE PIU' CONDIZIONI DI FILTRO SU SOTTORECORD
      cmd = collection
        .find({ pubblicazioni: { $elemMatch: { editore: regex, anno: 2010 } } })
        .project({
          titolo: 1,
          autore: 1,
          "pubblicazioni.editore": 1,
          "pubblicazioni.anno": 1,
        })
        .toArray();
      break;
    /*28) Elenco di tutti i libri pubblicati dalla einaudi (scritto in formato case insensitive) nel 2010 
        Visualizzare titolo, autore e, per ogni libro, la singola pubblicazione che ha dato match.*/
    case 28:
      collection = client.db(dbname).collection("biblioteca");
      regex = new RegExp("einaudi", "i");
      cmd = collection
        .find({ pubblicazioni: { $elemMatch: { editore: regex, anno: 2010 } } })
        .project({
          titolo: 1,
          autore: 1,
          //pubblicazioni: { $elemMatch: { editore: regex, anno: 2010 } },
          "pubblicazioni.$": 1,
        })
        .toArray();
      break;
    /*29) Sul libro “I promessi sposi” 
        Incrementare di 1 il numero di pagine dell’edizione Mondadori (supponendo che 
        ne esista solo una) */
    case 29:
      collection = client.db(dbname).collection("biblioteca");
      regex = new RegExp("promessi sposi", "i");
      cmd = collection.updateOne(
        {
          titolo: regex,
          "pubblicazioni.editore": "MieEdizioni",
        },
        {
          $inc: { "pubblicazioni.$.nPagine": 1 },
        }
      );
      break;
    //30) Sul libro “I promessi sposi” Incrementare di 1 il numero di pagine di tutte le edizioni
    case 30:
      collection = client.db(dbname).collection("biblioteca");
      regex = new RegExp("promessi sposi", "i");
      //solo un libro da modificare, poi ci sono tante edizioni (sottorecord)
      cmd = collection.updateOne(
        {
          titolo: regex,
        },
        {
          //quando non ci sono condizioni sui sottorecord per fare l'update di tutti
          //i sottorecord uso $[]
          $inc: { "pubblicazioni.$[].nPagine": 1 },
        }
      );
      break;
    case 31:
      collection = client.db(dbname).collection("orders");
      cmd = collection
        .aggregate([
          {
            $match: {
              status: "A",
            },
          },
          {
            $group: {
              _id: "$cust_id",
              somma: { $sum: "$amount" },
            },
          },
          {
            $sort: {
              somma: -1, //decrescente
            },
          },
          {
            $project: {
              // ricostruisco esplicitamente i campi nell'ordine desiderato
              cast_id: "$_id",
              somma: "$somma",
              _id: 0,
            },
          },
        ])
        .toArray();
      break;
    case 32:
      collection = client.db(dbname).collection("orders");
      cmd = collection
        .aggregate([
          {
            //con group le informazioni di dettaglio vengono perse
            $group: {
              _id: "$cust_id",
              avgAmount: {
                //la media dei prezzi singoli
                $avg: "$amount",
              },
              avgTotal: {
                //media del valore complessivo di ciascun ordine
                $avg: {
                  //moltiplicazione di tutti i parametri che gli passo
                  $multiply: ["$qta", "$amount"],
                },
              },
            },
          },
          {
            //creo nuovi campo in base a cosa voglio da ciascuno
            $project: {
              cust_id: "$_id",
              avgAmount: {
                $round: ["$avgAmount", 1], //arrotonda ad una cifra dopo la virgola avgAmount
              },
              avgTotal: {
                $round: ["$avgTotal", 1], //arrotonda ad una cifra dopo la virgola avgTotal
              },
              _id: 0,
            },
          },
        ])
        .toArray();
      break;
    case 33:
      collection = client.db(dbname).collection("orders");
      cmd = collection
        .aggregate([
          {
            $group: {
              //nome del campo su cui vogliamo fare il raggruppamento
              _id: "$gender",
              //somma 1 per ogni record presente nel gruppo (praticamente una count)
              nEsemplari: {
                $sum: 1,
              },
            },
            $project: {
              //come gender il valore del campo di $_id
              gender: "$_id",
              _id: 0,
              nEsemplari: "$nEsemplari",
            },
          },
        ])
        .toArray();
      break;
    case 34:
      collection = client.db(dbname).collection("orders");
      cmd = collection
        .aggregate([
          {
            $group: {
              //nome del campo su cui vogliamo fare il raggruppamento
              _id: "$gender",
              //media di quanti vampiri hanno ucciso maschi e femmine
              mediaVampiriUccisi: {
                $avg: "$vampires",
              },
            },
            $project: {
              //come gender il valore del campo di $_id
              gender: "$_id",
              _id: 0,
              mediaVampiriUccisi: { $round: ["$mediaVampiriUccisi", 0] },
            },
          },
        ])
        .toArray();
      break;
    case 35:
      collection = client.db(dbname).collection("orders");
      cmd = collection
        .aggregate([
          {
            $group: {
              _id: {
                gender: "$gender",
                hair: "$hair",
              },
              nEsemplari: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              gender: "$_id.gender",
              hair: "$_id.hair",
              nEsemplari: "$nEsemplari",
            },
          },
          {
            $sort: { nEsemplari: -1 },
          },
        ])
        .toArray();
      break;
    case 36:
      collection = client.db(dbname).collection("orders");
      //COSI' NON SI PU0', BISOGNA FARE GRUPPO FITTIZIO, un gruppo che prende tutti i record
      /*cmd=collection.aggregate([
            {
              $project:{
                mediaVampiriUccisi:{$avg:"$vampires"}
              }
            }
          ]
        ).toArray()*/
      cmd = collection
        .aggregate([
          {
            $group: {
              _id: {},
            },
          },
          {
            $project: {
              mediaVampiriUccisi: { $avg: "$vampires" },
            },
          },
        ])
        .toArray();
      break;
    case 37:
      collection = client.db(dbname).collection("quizzes");
      cmd = collection
        .aggregate([
          {
            $project: {
              quizAvg: { $round: [{ $avg: "$quizzes" }, 1] },
              labAvg: { $round: [{ $avg: "$labs" }, 1] },
              examAvg: { $round: [{ $avg: ["$midterm", "$final"] }, 1] },
            },
          },
          {
            $group: {
              //ROUND qui non si può usare dentro group
              //quindi faccio di nuovo project
              _id: "",
              quizAvgClass: { $avg: "$quizAvg" },
              labAvgClass: { $avg: "$labAvg" },
              examAvgClass: { $avg: "$examAvg" },
            },
          },
          {
            $project: {
              _id: 0,
              quizAvgClass: { $round: ["$quizAvgClass", 1] },
              labAvgClass: { $round: ["$labAvgClass", 1] },
              examAvgClass: { $round: ["$examAvgClass", 1] },
            },
          },
        ])
        .toArray();
      break;
    case 38:
      collection = client.db(dbname).collection("students");
      cmd = collection
        .aggregate([
          {
            $match: {
              genere: "f",
            },
          },
          {
            $project: {
              nome: 1,
              media: { $round: [{ $avg: "$voti" }, 1] },
            },
          },
          {
            $sort: { media: -1 }, //ordiniamo per campo avg
          },
          {
            $match: {
              media: { $gte: 6 }, //prendo solo quelle conn media > 6, è un having
            },
          },
          {
            $limit: 2, //prendo i primi due
          },
          {
            $skip: 1, //skippo primi due per prendere seconda con media più alta
          },
        ])
        .toArray();
      break;
    case 39:
      collection = client.db(dbname).collection("orders");
      cmd = collection
        .aggregate([
          {
            $project: {
              status: 1,
              nDettagli: 1,
              _id: 0
            }
          }
          ,
          {
            $unwind: "$nDettagli"
          },
          {
            $group: {
              _id: "$status",
              total: { $num: "$nDettagli" }
            }
          },
          {
            $match: {
              total: { $gte: 100 }
            }
          }
        ])
        .toArray();
      break;
    case 40:
      /*28) Elenco di tutti i libri pubblicati dalla einaudi (scritto in formato case insensitive) nel 2010 
        Visualizzare titolo, autore e, per ogni libro, la singola pubblicazione che ha dato match.*/
      collection = client.db(dbname).collection("orders");
      regex = new RegExp("einaudi", "i");
      cmd = collection
        .aggregate([
          {
            $unwind: "$pubblicazioni"
          },
          {
            $match: {
              "pubblicazioni.editore": regex,
              "pubblicazioni.anno": 2010,
            }
          },
          {
            $project: {
              _id: 0,
              autore: 1,
              titolo: 1,
              pubblicazioni: 1
            }
          }
        ]).toArray()
      break;
    case 41:
      // Unicorns — trovare quelli che NON hanno il campo “hair” (campi mancanti)
      collection = client.db(dbname).collection("unicorns")
      cmd = collection.find({ 'hair': { $exists: false } }).toArray()
      break
    case 42:
      // Unicorns — contare quanti unicorni amano l’uva
      collection = client.db(dbname).collection("unicorns")
      cmd = collection.countDocuments({ loves: 'grape' })
      break
    case 43:
      // Unicorns — trovare gli unicorni che pesano più di 500 kg, ordinati per peso crescente
      collection = client.db(dbname).collection("unicorns")
      cmd = collection.find({ weight: { $gt: 500 } }).sort({ weight: 1 }).toArray()
      break
    case 44:
      // Unicorns — aggiungere “banana” a tutti gli unicorni che NON la hanno
      collection = client.db(dbname).collection("unicorns")
      cmd = collection.updateMany({ loves: { $nin: ['banana'] } }, { $addToSet: { loves: 'banana' } })
      break
    case 45:
      // Unicorns — eliminare gli unicorni che hanno ucciso meno di 20 vampiri
      collection = client.db(dbname).collection("unicorns")
      cmd = collection.deleteMany({ vampires: { $lt: 60 } })
      break
    case 46:
      // Nella biblioteca, trova i libri che hanno almeno una pubblicazione Mondadori successiva al 2010.
      collection = client.db(dbname).collection("biblioteca")
      cmd = collection.find({ pubblicazioni: { $elemMatch: { anno: { $gt: 2010 } } } }).toArray()
      break
    case 47:
      collection = client.db(dbname).collection("biblioteca")
      cmd = collection.distinct('autore')
      break
    case 48:
      // Incrementa di 5 il numero di pagine per tutte le pubblicazioni dell’editore Einaudi.
      collection = client.db(dbname).collection("biblioteca")
      cmd = collection.updateMany({ "pubblicazioni.editore": "Einaudi" }, { $inc: { "pubblicazioni.$[].nPagine": 5 } })
      break
    case 49:
      // Usando unwind e group, raggruppa tutte le pubblicazioni per editore e conta quante pubblicazioni ha ciascuno.
      collection = client.db(dbname).collection("biblioteca")
      cmd = collection.aggregate([
        { $unwind: "$pubblicazioni" },
        {
          $group: {
            _id: "$pubblicazioni.editore",
            nLibri: { $sum: 1 }
          }
        },
        { $project: { editore: "$_id", nLibri: 1, _id: 0 } }
      ]).toArray();
      break
    case 50:
      // Trova il libro (considerando tutte le pubblicazioni) con il numero di pagine più alto.
      collection = client.db(dbname).collection("biblioteca")
      cmd = collection.aggregate([
        { $unwind: "$pubblicazioni" },
        { $sort: { "pubblicazioni.nPagine": -1 } },
        { $limit: 1 },
        {
          $project: {
            titolo: 1,
            autore: 1,
            editore: "$pubblicazioni.editore",
            nPagine: "$pubblicazioni.nPagine",
            _id: 0
          }
        }
      ]).toArray();
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

executeQuery(50);
