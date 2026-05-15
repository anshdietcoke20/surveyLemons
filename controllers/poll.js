import Poll from "../models/poll.js";

async function handleCreatePoll(req, res) {
    const {questions } = req.body 

    const formatted = questions.map(q => ({
        question: q.question,
        options: q.options,
        votes: q.options.map(() => 0), 
        required: q.required
    }));

    const poll = await Poll.create({
        createdBy: req.user.userId,
        questions: formatted
    });

    return res.redirect(`/poll/${poll._id}`)
}

async function handleGetPoll(req, res) {
    const poll = await Poll.findById(req.params.id);
    if(!poll) return res.status(404).json({error: "Poll not found"})
        return res.json(poll)
}

async function handlePublishPoll(req, res) {
    const poll = await Poll.findById(req.params.id)
    if(!poll) return res.status(404).json({error: "Poll not found"})
        if(poll.createdBy.toString() !== req.user.userId)
            return res.status(403).json({error: "Not authorised"})
    
    poll.published = true
    await poll.save()
    return res.json({success: true})
}

export{
    handleCreatePoll,
    handleGetPoll,
    handlePublishPoll
}