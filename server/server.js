require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;

function extractJson(text){
  const m = text.match(/\{[\s\S]*\}/);
  return m ? m[0] : null;
}

function fallbackParse(instruction){
  // very small fallback: naive parsing
  instruction = instruction.toLowerCase();
  let action=null; if(/add|buy|append|put/.test(instruction)) action='ADD';
  if(/remove|delete|remove from/.test(instruction)) action='REMOVE';
  if(/update|change|set/.test(instruction)) action='UPDATE';
  if(/clear/.test(instruction)) action='CLEAR';
  if(/search|find/.test(instruction)) action='SEARCH';
  const num = instruction.match(/\\b(\\d+)\\b/);
  const quantity = num ? Number(num[1]) : null;
  const item = instruction.replace(/.*?(?:add|buy|append|remove|delete|update|change|set|clear|search|find)\s*/,'').replace(/\b(\d+)\b/,'').trim() || null;
  return { action, item, quantity, metadata:{} };
}

app.post('/api/parse', async (req,res)=>{
  const { instruction } = req.body;
  if(!instruction) return res.status(400).json({error:'instruction required'});
  if(!OPENAI_KEY){
    return res.json({ok:true,result:fallbackParse(instruction)});
  }
  const prompt = `
You are an assistant that converts a shopping instruction into a strict JSON:
{"action":"ADD"|"REMOVE"|"UPDATE"|"SEARCH"|"CLEAR"|"COMPLETE","item":string|null,"quantity":number|null,"metadata":{}}
Instruction: "${instruction}"
Return only the JSON.
`;
  try{
    const r = await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model:"gpt-4o-mini",
        messages:[{role:'user',content:prompt}],
        max_tokens:200,
        temperature:0
      })
    });
    const data = await r.json();
    const raw = (data.choices && data.choices[0].message && data.choices[0].message.content) || data.choices[0].text;
    const jsonText = extractJson(raw);
    if(!jsonText) return res.status(500).json({error:'invalid json from ai', raw});
    const parsed = JSON.parse(jsonText);
    return res.json({ok:true,result:parsed});
  }catch(e){
    return res.status(500).json({error:e.message});
  }
});

const port = process.env.PORT || 4000;
app.listen(port,()=>console.log('AI parse server running on',port));
