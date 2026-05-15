const questions = []
let currentCard = 0 
const cardStack = document.querySelector(".card-stack")
const addQueBtn = document.getElementById("add-question");
const createPollBtn = document.getElementById("create-poll")

addQueBtn.addEventListener("click", () => {
    //save current card and next par jaao
    const saved = saveCurrentCard()

    if(!saved) return

    currentCard++;

    //making new card
    const card = document.createElement("div")
    card.classList.add("card")
    card.id = `card-${currentCard}`
    card.innerHTML = `
     <input type="text" placeholder="Enter your question here" class="question-input">

        <div class="toggle-row">
            <label>
                <input type="checkbox" class="required-checkbox"> Required
            </label>
        </div>

        <div id="options">
            <input type="text" placeholder="Option 1" class="pick">
            <input type="text" placeholder="Option 2" class="pick">
            <input type="text" placeholder="Option 3" class="pick">
            <input type="text" placeholder="Option 4" class="pick">
        </div> `

        cardStack.appendChild(card); 


        document.querySelector(".card.active").classList.remove("active")
        card.classList.add("active")
})

createPollBtn.addEventListener("click", async () => {
    const saved = saveCurrentCard()
    if (!saved) return

    const res = await fetch("/poll/create", {
        method: "POST", 
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify({questions})
    })

    if(res.redirected){
        window.location.href = res.url
    }
});

function saveCurrentCard(){ //save current que into array of ques
    const activeCard = document.querySelector(".card.active")
    const que = activeCard.querySelector(".question-input").value.trim()
    const required = activeCard.querySelector(".required-checkbox").checked
    const options = [...activeCard.querySelectorAll(".pick")]
    .map( i => i.value.trim())
    .filter(v => v !== "")

    if(!que){
        alert ("Enter question");
        return false
    }

    if(options.length < 2){
        alert ("Enter atleast 2 options")
        return false
    }

    questions[currentCard] = {question: que, options, required}
    return true
}
