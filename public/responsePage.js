const pollId = window.location.pathname.split("/")[2]

async function loadResponse() {

    const res =await fetch (`/poll/api/${pollId}`)
    const poll = await res.json()
    render(poll)
}

function render(poll){
  const totalVotesPerQ = poll.questions.map( q => 
    q.votes.reduce((a,b) => a+b , 0) 
  )

  const totalResponses = Math.max(...totalVotesPerQ, 0)
  const totalVotesCast = totalVotesPerQ.reduce((a,b) => a + b, 0)
  const avgPerQ = poll.questions.length ? Math.round(totalVotesCast/poll.questions.length) : 0;

  document.getElementById("subtitle").textContent = `${poll.questions.length} question ${poll.questions.length !== 1 ? "s" : ""} ·  Live results`

  let html = `<div class="summary-row">
                    <div class="summary-card">
                        <div class="stat-number">${totalResponses}</div>
                        <div class="stat-label">Total Responses</div>
                    </div>
                    <div class="summary-card">
                        <div class="stat-number">${poll.questions.length}</div>
                        <div class="stat-label">Questions</div>
                    </div>
                    <div class="summary-card">
                        <div class="stat-number">${totalVotesCast}</div>
                        <div class="stat-label">Votes Cast</div>
                    </div>
                    <div class="summary-card">
                        <div class="stat-number">${avgPerQ}</div>
                        <div class="stat-label">Avg Votes / Q</div>
                    </div>
                </div>
 
                <div class="questions-section">`

                poll.questions.forEach((q, qi) => {
                    const total = q.votes.reduce((a,b) => a +b, 0)
                    const maxVotes = Math.max(...q.votes)

                    html += `
                    <div class = "question-card">
                    <div class="q-label"> Question ${qi + 1} ${q.required ?  " · Required" : ""} </div>
                    <div class="q-text"> ${q.question}</div>`

                    q.options.forEach((opt, oi) => {
                        const votes = q.votes[oi]
                        const percentage = total === 0 ? 0 : Math.round((votes / total) * 100)
                        const mostVotes = votes === maxVotes && maxVotes > 0

                        html += `
                        <div class="option-row">
                        <div class = "option-meta">
                        <span class="option-name">
                        ${opt}
                        ${mostVotes ? '<span class= "winner-tag"> Leading </span>' : ""}
                        </span> 
                          
                                <span class="option-stats">${votes} vote${votes !== 1 ? "s" : ""} · ${percentage}%</span>
                            </div>
                            <div class="bar-bg">
                                <div class="bar-fill" style="width: ${percentage}%"></div>
                            </div>
                        </div>
                        `
                    })
                    html += `</div>`
                });

                html += `</div>`

                const isPublished = poll.published 

                html+= `
                  <div class = "publish-section">
                 ${isPublished ? `<div class = "published-badge"><i class="ri-checkbox-circle-line"></i> Results Published</div>` : 
                 `<button id = "publish-btn" onclick="publishPoll()"> 
                   <i class="ri-send-plane-2-line"></i> Publish Final Results
                           </button>
                 `}
                 </div> 
                 `

                 document.getElementById("app").innerHTML = html 
}

async function publishPoll() {
    const btn = document.getElementById("publish-btn")
    btn.disabled = true
    btn.textContent = "Publishing..."

    const res = await fetch (`/poll/${pollId}/publish`, {method:"POST"})
    if(res.ok){
        loadResponse()
    } else {
        btn.disabled = false
        btn.innerHTML = 'Publish Results'
        alert("Failed to publish")
    }
}
 loadResponse()
