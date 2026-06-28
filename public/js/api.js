// ── AI proxy ──────────────────────────────────────────────────────────────────
async function ai(system, messages, maxTokens) {
  const res = await fetch("/api/chat", {
    method:"POST", headers:{"content-type":"application/json","x-token":state.app.authToken||""},
    body:JSON.stringify({model:"mimo-v2-flash",max_tokens:maxTokens||1000,temperature:0.7,
      messages:[{role:"system",content:system}].concat(messages)})
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message||JSON.stringify(data.error));
  if (!data.choices||!data.choices.length) throw new Error("Empty response");
  return data.choices[0].message.content;
}
