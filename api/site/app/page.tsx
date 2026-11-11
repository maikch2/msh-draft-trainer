export default function Home() {
  return <main style={{maxWidth:760,margin:'64px auto',padding:'0 24px',fontFamily:'system-ui',lineHeight:1.65}}>
    <p style={{color:'#6d28d9',fontWeight:700}}>DRAFT RATING TRAINER</p>
    <p><a href="/practice/#fra/drill">Open voice and shared practice</a> · Sign in with the site owner's ChatGPT account.</p>
    <h1 style={{fontSize:40,lineHeight:1.15}}>All cards or a random drill batch</h1>
    <p>Load a batch, read the name, colors and mana cost, then ask for a grade from 1 to 5.
      Keep the rating hidden until the answer. Error is the absolute difference between the guess and rating.</p>
    <p><a href="/api/drill?set=fra&count=all">Get all Reality Fracture cards (JSON)</a><br/>
      <a href="/api/drill?set=fra&count=50">Get 50 Reality Fracture cards (JSON)</a><br/>
      <a href="/api/drill?set=fra&count=100">Get 100 Reality Fracture cards (JSON)</a></p>
    <p><a href="/practice/#trk/drill">Star Trek voice and shared practice</a><br/>
      <a href="/api/drill?set=trk&count=all">Get all Star Trek cards (JSON)</a><br/>
      <a href="/api/drill?set=trk&count=50">Get 50 Star Trek cards (JSON)</a><br/>
      <a href="/api/drill?set=trk&count=100">Get 100 Star Trek cards (JSON)</a></p>
    <h2>Request</h2>
    <pre style={{background:'#f4f1fc',padding:16,overflowX:'auto'}}>GET /api/drill?set=fra&amp;count=all</pre>
    <p>Sets: <code>trk</code>, <code>fra</code>, <code>hob</code>, <code>msh</code>. Count: all (default), 50 or 100.
      No sign-in or API key. All returns every imported card once in source order, including unrated cards with a null rating. Skip unrated cards when grading. Random requests draw a new batch; add a unique <code>nonce</code> if your chat tool reuses a URL result.</p>
    <h2>Same selection as Drill</h2>
    <p>For random batches, only rated cards are eligible. Each common has weight 9, uncommon 3, rare 0.9 and mythic 0.18.
      Special rarity has weight 0.5; Marvel bonus cards use 0.35. These are per-card weights, not rarity percentages.
      No card repeats immediately, but cards may return later in a batch.</p>
    <p>Random GET batches match Drill with reset memory. For personalized practice, POST JSON with <code>history</code>
      mapping card IDs to <code>[average_error, times_rated]</code>, and optional <code>previous_card_id</code>.
      History stays fixed throughout the batch. Browser mistake memory is not read automatically.</p>
    <pre style={{background:'#f4f1fc',padding:16,overflowX:'auto'}}>{JSON.stringify({set:'fra',count:50,history:{'1132632':[1.5,3]},previous_card_id:1132632},null,2)}</pre>
    <p>Ratings are read from the trainer’s published data and cached for up to one minute.
      The response includes the data’s update time. Random batches include the last card ID for continuing a session; all-card responses return null for that field.</p>
    <p><a href="https://maikch2.github.io/msh-draft-trainer/#fra/drill">Open the trainer</a> · <a href="https://github.com/maikch2/msh-draft-trainer">Source and API documentation</a></p>
  </main>;
}
