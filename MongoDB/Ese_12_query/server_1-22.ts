import { MongoClient, ObjectId } from "mongodb";

//porta di ascolto di mongo demone
const connectionString = "mongodb://127.0.0.1:27017";
const dbname = "unicorns";

const query = 21;

async function executeQuery(query: number) {
    const client = new MongoClient(connectionString);
    await client.connect().catch(function (err) {
        console.log("Errore di connessione al databse");
    });
    const collection = client.db(dbname).collection("unicorns");
    let cmd;
    switch (query) {
        //1) Trovare gli unicorni che hanno un peso compreso tra 700 e 800
        //gte ed lte è per estremi inclusi, se no gt ed lt
        case 1:
            cmd = collection.find({ weight: { $gte: 700, $lte: 800 } }).toArray();
            break;
        //2) Trovare gli unicorni di genere maschile che amano l’uva e che hanno ucciso più di 60 vampiri
        case 2:
            //AND in forma breve
            //cmd=collection.find({gender:"m", loves:"grape", vampires:{$gte:60}}).toArray();
            //AND in forma completa (obbligatoria in caso di OR)
            cmd = collection
                .find({
                    $and: [
                        { gender: "m" },
                        { loves: "grape" },
                        { vampires: { $gte: 60 } },
                    ],
                })
                .toArray();
            break;
        //3) Trovare gli unicorni di genere femminile o che pesano meno di 700 kg
        case 3:
            cmd = collection
                .find({
                    $or: [{ gender: "f" }, { weight: { $lte: 700 } }],
                })
                .toArray();
            break;
        //4) Trovare gli unicorni che amano (l’uva o le mele) e che hanno ucciso più di 60 vampiri
        case 4:
            /*cmd = collection
              .find({
                $and: [
                  { $or: [{ loves: "apple" }, { loves: "grape" }] },
                  { vampires: { $gte: 60 } },
                ],
              })
              .toArray();*/
            cmd = collection
                .find({
                    loves: { $in: ["apple", "grape"] },
                    vampires: { $gte: 60 },
                })
                .toArray();
            break;
        //5) Trovare gli unicorni che amano (l’uva e il watermelon) e che hanno ucciso più di 60 vampiri
        case 5:
            cmd = collection
                .find({
                    loves: { $all: ["grape", "watermelon"] },
                    vampires: { $gte: 60 },
                })
                .toArray();
            break;
        //6) Trovare gli unicorni che hanno il pelo marrone oppure grigio
        case 6:
            cmd = collection
                .find({
                    //in e nin anche per campi scalari(sincola stringa o numero o bool, no array)
                    hair: { $in: ["grey", "brown"] },
                })
                .toArray();
            break;
        //7) Trovare gli unicorni non vaccinati (compresi quelli dove vaccinated non esiste)
        case 7:
            cmd = collection
                .find({
                    $or: [{ vaccinated: false }, { vaccinated: { $exists: false } }]
                })
                .toArray();
            break;
        //8) Trovare gli unicorni maschi che NON amano le mele
        case 8:
            cmd = collection
                .find({
                    gender: "m",
                    loves: { $nin: ["apple"] }
                })
                .toArray();
            break;
            break;
        //9) Trovare gli unicorni di genere femminile il cui nome inizia con la lettera A (regex)
        case 9:
            const regex = new RegExp("^[aA]"); //quadra significa uno dei caratteri
            //const regex=new RegExp("^a","i")
            cmd = collection
                .find({
                    gender: "f",
                    name: regex
                })
                .toArray();
            break;
        //10) Trovare un unicorno sulla base dell’ID (ObjectId)
        case 10:
            //_id: "68fa14ade39daa7baddbb0d8"
            let objectId = new ObjectId("68fa14ade39daa7baddbb0d8")
            cmd = collection
                .find({
                    _id: objectId
                })
                .toArray();
            break;
        case 11:
            /*
            11a) Visualizzare nome e vampiri uccisi per tutti gli unicorni di genere maschile
            mettendo ad 1 i campi che volgio visualizzare o a 0 quelli che non voglio vedere 
            (no misto, tranne l'id che se voglio escludere lo devo mettere a 0 anche in oresenza di 1)
            */

            //11b) Visualizzare i dati precedenti in modo ordinato sul n. decrescente di vampiri uccisi 

            //11c) Rispetto al recordset precedente, visualizzare soltanto i primi 3 record

            cmd = collection
                .find({
                    gender: "m",
                    vampires: { $exists: true }
                })
                .project({ name: 1, vampires: 1 })
                .sort({ vampires: -1, nome: 1 })
                //oltre limit simile skip, eseguita prima del limit a prescindere di dov'è scritta
                //per saltarne uno, dentro gli metti il numero di quello da saltare
                .limit(3)
                //.skip(1)
                .toArray();
            break;
        //12) Contare il numero di unicorni che pesano più di 500 kg
        case 12:
            cmd = collection.countDocuments({
                weight: { $gte: 500 }
            });
            break;
        //13) Visualizzare peso e pelo dell’unicorno Aurora (findOne)
        case 13:
            cmd = collection.findOne({
                name: "Aurora"
            },
                {
                    projection: { weight: 1, hair: 1, _id: 0 }
                }
            );
            break;
        //14) Visualizzare i frutti amati dagli unicorni di genere femminile (ogni frutto una sola volta) (distinct) 
        case 14:
            cmd = collection.distinct("loves", {
                gender: "f"
            })
            break;
        //15) Inserire un nuovo unicorno e, 
        case 15:
            let unicorn = {
                name: "pippo",
                residenza: "Fossano"
            };
            cmd = collection.insertOne(unicorn);
            break;
        //16)  Cancellare l’unicorno precedente sulla base del name
        case 16:
            //eliminano indipendentemente da come siano scritti pippo e fossano
            const regName = new RegExp("^pippo$", "i")
            const regRes = new RegExp("^fossano$", "i")
            cmd = collection.deleteOne({ name: regName, residenza: regRes });
            break;
        //17) Incrementare di 1 il numero dei vampiri uccisi da Pilot 
        case 17:
            cmd = collection.updateOne({
                name: "Pilot"
            },
                {
                    $inc:
                    {
                        vampires: 1
                    }
                }
            )
            break;
        //18) Aggiungere che l’unicorno Aurora ama anche le carote ed il suo peso è aumentato di 10kg
        case 18:
            cmd = collection.updateOne(
                {
                    name: "Aurora"
                },
                {
                    $addToSet:
                    {
                        loves:
                        {
                            $each:
                                [
                                    "carrot", "sugar"
                                ]
                        }
                    },
                    $inc:
                    {
                        weight: 10
                    }
                }
            )
            break;
        //19) Incrementare di 1 il numero di vampiri uccisi dall’unicorno Pluto. Se il record non esiste crearlo
        case 19:
            cmd = collection.updateOne(
                {
                    name: "Pluto"
                },
                {
                    $inc: {
                        vampires: 1
                    }
                },
                {
                    upsert: true
                }
            )
            break;
        //20) Aggiungere il campo vaccinated=false a tutti gli unicorni che non dispongono del campo vaccinated
        case 20:
            cmd = collection.updateMany({
                vaccinated: {
                    $exists: false
                }
            },
                {
                    $set: { vaccinated: false }
                })
            break;
        //21) Rimuovere gli unicorni che amano sia l’uva sia le carote
        case 21:
            cmd = collection.deleteMany({
                loves: { $all: ["grape", "carrot"] }
            })
            break;
        //22) Trovare l’unicorno femmina che ha ucciso il maggior numero di vampiri.  
        //Restituire nome e numero di vampiri uccisi 
        case 22:
            cmd = collection.find({gender: "f"})
            .sort({vampires: "desc"})
            .limit(1)
            .project({name:1, vampires:1, _id:0})
            .toArray()
            break;
    }
    cmd?.then(function (data) {
        console.log(data);
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

executeQuery(22);