const socket = io()

const pollId = window.location.pathname.split("/").pop()

let poll = null 
let currentQ = 0
let answered = []

async function loadPoll(){
    const res = await fetch (`/poll/api/${pollId}`)
    poll = await res.json()
    answered = new Array(poll.questions.length).fill(false)

    socket.emit("join-poll", pollId)
    renderQuestion(0)
    updateProgress()
}

function renderQuestion(index){
    const q = poll.questions[index]
    const cardStack = document.querySelector(".card-stack")
    cardStack.innerHTML = "";

    const card = document.createElement("div")
    card.classList.add("card", "active")

    const star = q.required ? '<span style ="color: red"> * </span>' : ""

    card.innerHTML = `
    <div class = "question"> ${q.question}${star}</div>
    <div class="responses"></div>`;

    const responseDiv = card.querySelector(".responses")

    q.options.forEach((option, i) => {
        const total = q.votes.reduce((a,b) => a + b, 0)
        const percentage = total === 0 ? 0 : Math.round((q.votes[i]/total) * 100 )

        responseDiv.innerHTML +=`
           <div class="option" data-index="${i}">
        <input type="radio" name="poll" id="opt-${i}">
        <label for="opt-${i}">
          <div class="row">
            <div class="column">
              <span class="circle"></span>
              <span class="option-text">${option}</span>
            </div>
            <span class="percentage" id="pct-${i}">${percentage}%</span>
          </div>
          <progress class="progress" id="prog-${i}" max="100" value="${percentage}"></progress>
        </label>
      </div>`
    });

    cardStack.appendChild(card)

    responseDiv.querySelectorAll(".option").forEach(opt => {
        opt.addEventListener("click", () => {
            const optionIndex = parseInt(opt.dataset.index)
            socket.emit("vote", {pollId, questionIndex: index, optionIndex })
            answered[index] = true
        })
    })
}

socket.on("vote-updated", ({questionIndex, votes}) => {
    if(questionIndex !== currentQ) return

    const total = votes.reduce((a,b) => a + b,0)
    votes.forEach((count, i) => {
     const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
    document.getElementById(`pct-${i}`).textContent = `${percentage}%`;
    document.getElementById(`prog-${i}`).value = percentage;
    })
})

const nextBtn = document.getElementById("next-btn")
nextBtn.addEventListener("click", clickNextBtn)

function clickNextBtn(){
    const que = poll.questions[currentQ]

    if(que.required && ! answered[currentQ]){
        const popup = document.getElementById("mandatory-popup")
        popup.style.display = "block"
        setTimeout(() => popup.style.display = "none", 2000)
        return
    }

    if(currentQ < poll.questions.length -1){
            currentQ++
            renderQuestion(currentQ)
            updateProgress()
    }
}

const prevBtn = document.getElementById("prev-btn")
prevBtn.addEventListener("click", clickPrevBtn)

function clickPrevBtn(){
    if (currentQ > 0){
        currentQ--
        renderQuestion(currentQ)
        updateProgress()
    }
}

const submitBtn = document.getElementById("submit-btn");
submitBtn.addEventListener("click", clickSubmit)

function clickSubmit(){
    for(let i = 0; i < poll.questions.length; i++){
        if(poll.questions[i].required && !answered[i]){
            const popup = document.getElementById("mandatory-popup") 
             popup.style.display = "block"
        setTimeout(() => popup.style.display = "none", 2000)
        currentQ = i 
        renderQuestion(currentQ)
        updateProgress()
        return
        }
    }
    window.location.href = `/poll/${pollId}/responses`
}

function updateProgress(){
    document.getElementById("progress").textContent = `${currentQ + 1} / ${poll.questions.length}`
}

loadPoll()