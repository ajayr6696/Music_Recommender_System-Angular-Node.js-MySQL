const db = require('../knexfile');
const knex = require('knex')(db.development);

exports.findUser = function (data) {
    return new Promise((resolve, reject) => {
        knex('users')
            .select('id', 'user_id', 'email', 'name')
            .where(data)
            .then(result => {
                resolve(result)
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
};

exports.removeLikedSongsOfUser = function (data) {
    return new Promise((resolve, reject) => {
        knex('liked')
            //.where('user_id', "17aa9f6dbdf753831da8f38c71b66b64373de613")
            .where(data)
            .del()
            .then(result => {
                resolve(result)
                console.log("success delete")
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
};

exports.addToLikedSongsOfUser = function (data) {
    return new Promise((resolve, reject) => {
        knex('liked')
            .insert(data)
            .then(result => {
                resolve(result)
                console.log("success insert")
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
};

exports.fetchAllSongs = function (user_id = null) {
    return new Promise((resolve, reject) => {
        knex('songs')
            .select('id', 'song_id', 'title', 'album', 'artist_name', 'year')
            //.limit(200)
            .then(result => {
                resolve(result)
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
};

exports.fetchAllUsers = function (user_id = null) {
    return new Promise((resolve, reject) => {
        knex('users')
            .select('id', 'user_id', 'email', 'password', 'name')
            //.limit(7)
            .then(result => {
                resolve(result)
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
};

exports.setCFRecommendations = function (id,song) {
    return new Promise((resolve, reject) => {
        knex('users')
        .update('cfresults', JSON.stringify(song))
        .where('id', id)
        .then(result => {
            console.log("Success:",id);
        })
        .catch(err => {
            throw new Error(err)
        })
    })
};

exports.fetchAllLikedSongs = function (user_id = null) {
    return new Promise((resolve, reject) => {
        knex('liked')
            .select('id', 'song_id', 'user_id')
            // .limit(6)
            .then(result => {
                resolve(result)
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
};

exports.fetchAllLikedSongsOfUser = function (id) {
    return new Promise((resolve, reject) => {
        knex('liked')
            .select('id', 'song_id', 'user_id')
            .where('user_id', id)
            .then(result => {
                resolve(result)
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
};

exports.fetchSimilarities = function (id) {
    return new Promise((resolve, reject) => {
        knex('songs')
            .select('similar_release', 'similar_title')
            .where('id', id)
            .then(result => {
                resolve(result)
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
};

exports.fetchCFrecommendation = function (id) {
    return new Promise((resolve, reject) => {
        knex('users')
            .select('cfresults')
            .where('id', id)
            .then(result => {
                resolve(result)
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
};

exports.fetchSongsFromSimilarities = function (songIds) {
    return new Promise((resolve, reject) => {
        knex('songs')
            .select('*')
            .whereIn('song_id', songIds)
            //.limit(10)
            .then(result => {
                resolve(result)
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
};

exports.fetchSongsFromSameYear = function (songId) {
    return new Promise((resolve, reject) => {
        knex('songs')
            .select('id', 'song_id', 'title', 'album', 'artist_name', 'year')
            .whereRaw(`year = (select year from songs where id = ${songId}) and artist_name = (select artist_name from songs where id = ${songId})`)
            .then(result => {
                resolve(result)
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
}