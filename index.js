require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");

var openaikey = process.env.OPENAI_KEY;
const configuration = new Configuration({
	apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const port = 3300;

app.use(bodyParser.text());

app.use(express.static(path.join(__dirname, 'public')));

const system_prompt = `
You help office workers figure out if a task is automate-able. They will describe a task that they suspect might be automate-able and you will make a judgement. First rephrase the question to a single, short sentence, then give a score from 0-100, where 0 is extremely easy to automate, and 100 would be extremely difficult. Then write a short paragraph on how it would be done. Then write a list of tools necessary, then write a list of skills necessary. At the beginning of each item for both lists, please add a relevant font awesome icon, like this: "<i class="fa-solid fa-envelope"></i> Email Marketing Service (e.g., Mailchimp, SendGrid)"

Please have the output be proper JSON in this format:
{
	question: "rephrased question here",
	score: [score here],
	explainer: "Explainer text here",
	tools: [
			"[icon] tool 1",
			"[icon] tool2"
			],
	skills: [
			"[icon] skill 1",
			"[icon] skill 2"
			]
}
`;

//route that gets a response from the GPT-4 API
app.post('/answer', async function(req, res) {
	var question = req.body;
	console.log(question);
	var completion = await getCompletion(buildMessages(question));
	res.send(completion);
});

function buildMessages(question) {
	var messages = [];
	messages.push({"role": "system", "content": system_prompt});
	messages.push({"role": "user", "content": question});
	return messages;
}

async function getCompletion(messages) {
	const completion = await openai.createChatCompletion({
		model: "gpt-4",
		messages: messages,
		max_tokens: 4000,
	});
	return completion.data.choices[0].message.content;
}

app.listen(port, function(){
	console.log('Automation-Advisor is running http://localhost:' + port);
});