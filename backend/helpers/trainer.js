const _ = require('underscore');
const Vector = require('vector-object');
const striptags = require('striptags');
const sw = require('stopword');
const natural = require('natural');
const fs = require('fs');
const { TfIdf, PorterStemmer, NGrams } = natural;
const tokenizer = new natural.WordTokenizer();
const db = require('../knexfile');
const knex = require('knex')(db.development);

let validateDocuments = function (documents) {
    return new Promise((resolve, reject) => {
        if (!_.isArray(documents)) {
            reject('Documents should be an array of objects');
        }

        for (let i = 0; i < documents.length; i += 1) {
            const document = documents[i];

            if (!_.has(document, 'song_id')) {
                reject('Documents should be have field id');
            }

            if (_.has(document, 'tokens') || _.has(document, 'vector')) {
                reject('"tokens" and "vector" properties are reserved and cannot be used as document properties"');
            }
        }
        resolve();
    })
};


let getTokensFromString = function (string) {
    console.log(string)
    return new Promise((resolve, reject) => {
        try {
            // remove html and to lower case
            const tmpString = striptags(string, [], ' ')
                .toLowerCase();

            // tokenize the string
            const tokens = tokenizer.tokenize(tmpString);

            // get unigrams
            const unigrams = sw.removeStopwords(tokens)
                .map(unigram => PorterStemmer.stem(unigram));

            // get bigrams
            const bigrams = NGrams.bigrams(tokens)
                .filter(bigram =>
                    // filter terms with stopword
                    (bigram.length === sw.removeStopwords(bigram).length))
                .map(bigram =>
                    // stem the tokens
                    bigram.map(token => PorterStemmer.stem(token))
                        .join('_'));

            // get trigrams
            const trigrams = NGrams.trigrams(tokens)
                .filter(trigram =>
                    // filter terms with stopword
                    (trigram.length === sw.removeStopwords(trigram).length))
                .map(trigram =>
                    // stem the tokens
                    trigram.map(token => PorterStemmer.stem(token))
                        .join('_'));

            resolve([].concat(unigrams, bigrams, trigrams));
        } catch (error) {
            reject(error)
        }
    })

}

let preprocessDocuments = async function (documents) {
    return new Promise(async (resolve, reject) => {
        console.log("************* Preprocessing initiated... *************")
        let processedDocuments = [];
        for (let i = 0; i < documents.length; i++) {
            const item = documents[i];
            try {
                let tokens = await getTokensFromString(item.title);
                processedDocuments.push({
                    id: item.song_id,
                    tokens,
                });
            } catch (error) {
                console.log("error in preprocessing -- ", error);
                reject(error)
            }
        }
        console.log(processedDocuments.length)
        resolve(processedDocuments);
    })
};

let produceWordVectors = (processedDocuments, options) => {
    console.log(processedDocuments)
    return new Promise((resolve, reject) => {
        console.log("************* Producing word vectors... *************")

        // process tfidf
        const tfidf = new TfIdf();

        for (let i = 0; i < processedDocuments.length; i++) {
            const processedDocument = processedDocuments[i];
            tfidf.addDocument(processedDocument.tokens);
        }

        // create word vector
        const documentVectors = [];

        for (let i = 0; i < processedDocuments.length; i += 1) {
            const processedDocument = processedDocuments[i];
            const hash = {};

            const items = tfidf.listTerms(i);
            const maxSize = Math.min(options.maxVectorSize, items.length);
            for (let j = 0; j < maxSize; j += 1) {
                const item = items[j];
                hash[item.term] = item.tfidf;
            }

            const documentVector = {
                id: processedDocument.id,
                vector: new Vector(hash),
            };

            documentVectors.push(documentVector);
        }
        resolve(documentVectors);
    })
};

let initializeDataHash = (documentVectors) => {
    return documentVectors.reduce((acc, item) => {
        acc[item.id] = [];
        return acc;
    }, {});
}

let orderDocuments = (data, options) => {
    // finally sort the similar documents by descending order
    Object.keys(data)
        .forEach((id) => {
            data[id].sort((a, b) => b.score - a.score);

            if (data[id].length > options.maxSimilarDocuments) {
                data[id] = data[id].slice(0, options.maxSimilarDocuments);
            }
        });
}
let calculateSimilarities = (documentVectors, options) => {
    return new Promise((resolve, reject) => {
        console.log("************* calculatin similarities... *************")
        const data = { ...initializeDataHash(documentVectors) };
        // calculate the similar scores
        for (let i = 0; i < documentVectors.length; i += 1) {
            for (let j = 0; j < i; j += 1) {
                let documentVectorA = documentVectors[i];
                const idi = documentVectorA.id;
                const vi = documentVectorA.vector;
                let documentVectorB = documentVectors[j];
                const idj = documentVectorB.id;
                const vj = documentVectorB.vector;
                const similarity = vi.getCosineSimilarity(vj);
                if (similarity > options.minScore) {
                    data[idi].push({
                        id: documentVectorB.id,
                        score: similarity
                    });

                    data[idj].push({
                        id: documentVectorA.id,
                        score: similarity
                    });
                }
            }
        }

        orderDocuments(data, options);

        resolve(data);
    })

};

exports.train = async (documents, options) => {
    try {
        await validateDocuments(documents);

        console.log("************* Training initiated *************")
        // step 1 - preprocess the documents
        const preprocessDocs = await preprocessDocuments(documents, options);

        // step 2 - create document vectors
        const docVectors = await produceWordVectors(preprocessDocs, options);

        // step 3 - calculate similarities
        let data = await calculateSimilarities(docVectors, options);
        let json_data = []
        console.log(data)
        // for (const key in data) {
        //     if (Object.hasOwnProperty.call(data, key)) {
        //         const similar_array = data[key];
        //         json_data.push({
        //             song_id: key,
        //             similar_array: JSON.stringify(similar_array)
        //         })
        //     }
        // };
        // for (let i = 0; i < json_data.length; i++) {
        //     const item = json_data[i];
        //     knex('songs')
        //         .update('similar_title', item.similar_array)
        //         .where('song_id', item.song_id)
        //         .then(result => {
        //             console.log("Success");
        //         })
        //         .catch(err => {
        //             throw new Error(err)
        //         })
        // }

        // jsonexport(json_data, function (err, csv) {
        //     if (err) return console.error(err);
        //     fs.writeFileSync('results.csv', csv)
        // });
        // fs.writeFileSync('results.json', JSON.stringify(json_data, null, 2))

    } catch (error) {
        console.log("error in training -- ", error);
    }
};