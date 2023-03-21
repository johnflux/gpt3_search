const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');

const configuration = new Configuration({
  apiKey: 'YOUR-API-KEY',
});
const openai = new OpenAIApi(configuration);

/** Generates embeddings for all guides in the database
 *  Then run:
 *   node generate_embeddings.js ./prod_backup_20230119.json > embeddings.json
 *   node embeddings_search.js ./embeddings.json
 */

var filenames = process.argv.slice(2);

if (filenames.length === 0) {
  console.log('Usage: node generate_embeddings_from_txt_files.js *.txt > embeddings.json');
  process.exit(1);
}

async function run() {
  const embeddings = [];
  for (const filename of filenames) {
    const input = fs.readFileSync(filename, 'utf8');

    try {
      const response = await openai.createEmbedding({ input, model: 'text-embedding-ada-002' });
      const output = { filename, embedding: response.data.data[0].embedding };
      embeddings.push(output);
      console.error('Success:', filename);
    } catch (e) {
      console.error('Failed:', filename);
    }
  }
  console.log(JSON.stringify(embeddings, null, 2));
}

run();
