getCategories()
window.onload = function () {
    btnInvia.addEventListener("click", rates)
    btnAdd.addEventListener("click", add)
}

async function getCategories() {
    let response = await inviaRichiesta("GET", "/api/categories")
    if (response.status == 200) {
        for (const category of response.data) {
            let option = document.createElement("option")
            option.value = category
            option.textContent = category
            catList.appendChild(option)
        }
        catList.addEventListener("change", function () {
            getFacts(catList.value)
        })
        getFacts(catList.value)
    }
    else
        alert(response.status + ": " + response.err)
}


async function getFacts(category) {
    let response = await inviaRichiesta("GET", "/api/facts", { category })
    if (response.status == 200) {
        let facts = response.data

        facts.sort(function (record1, record2) {
            let str1 = record1["score"];
            let str2 = record2["score"];
            if (str1 < str2)
                return 1;
            else
                return -1;
        });
        fillFacts(facts)
    }
    else
        alert(response.status + ": " + response.err)
}

async function rates() {
    let chks = mainWrapper.querySelectorAll('input[type="checkbox"]:checked')
    console.log(chks)
    let ids = []
    for (const chk of chks)
        ids.push(chk.value)
    console.log(ids)
    let response = await inviaRichiesta("POST", "api/rate", { ids })
    if (response.status == 200) {
        alert(response.data)
        getFacts(catList.value)
    }
    else
        alert(response.status + ": " + response.err)

}

async function add() {
    let category = catList.value
    let value = newFact.value
    let response = await inviaRichiesta("POST", "/api/add", { category, value })
    if (response.status == 200) {
        alert(response.data)
        getFacts(catList.value)
    }
    else
        alert(response.status + ": " + response.err)
}

function fillFacts(facts) {
    mainWrapper.querySelectorAll("input").forEach(i => i.remove());
    mainWrapper.querySelectorAll("span").forEach(s => s.remove());
    mainWrapper.querySelectorAll("br").forEach(b => b.remove());
    for (const fact of facts) {
        // console.log(fact)
        let input = document.createElement("input")
        input.type = "checkbox"
        input.value = fact.id
        mainWrapper.insertBefore(input, btnInvia)

        let span = document.createElement("span")
        span.textContent = fact.value
        mainWrapper.insertBefore(span, btnInvia)

        let br = document.createElement("br")
        mainWrapper.insertBefore(br, btnInvia)
    }
}