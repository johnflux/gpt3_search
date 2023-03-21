const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: 'YOUR-API-KEY',
});
const openai = new OpenAIApi(configuration);

var jsonfilename = './embeddings.json';
const searchTerm = process.argv.slice(2).join(' ');

if (!searchTerm) {
  console.log('Usage: node embeddings_search.js diabetes referral guide');
  process.exit(1);
}

const data = require('./' + jsonfilename);

async function run() {
  const response = await openai.createEmbedding({ input: searchTerm, model: 'text-embedding-ada-002' });
  const embedding = response.data.data[0].embedding;
  const results = getScores(data, embedding);

  console.log(results.map((a) => `${a.score.toFixed(2)}: ${a.filename}]`).join('\n'));
}
run();

function getScores(data, embedding) {
  const results = data
    .map((doc) => ({ score: cosinesim(doc.embedding, embedding), doc }))
    .sort((a, b) => b.score - a.score)
    .filter((doc, index) => index < 3 || (index < 10 && doc.score > 0.7));

  const titles = results.map((doc) => doc.doc.title);
  const results_uniq = results.filter((x, index) => titles.indexOf(x.doc.title) === index);
  return results_uniq;
}

function cosinesim(A, B) {
  var dotproduct = 0;
  var mA = 0;
  var mB = 0;
  for (let i = 0; i < A.length; i++) {
    dotproduct += A[i] * B[i];
    mA += A[i] * A[i];
    mB += B[i] * B[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  var similarity = dotproduct / (mA * mB);
  return similarity;
}
